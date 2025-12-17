import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoadmapResponse } from "./types";

// Helper: Simple fuzzy match for suggestions (Client-side logic optimization)
const SIMILAR_ROLES: Record<string, string[]> = {
    "developer": ["Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"],
    "designer": ["UX Designer", "UI Designer", "Graphic Designer", "Product Designer"],
    "manager": ["Product Manager", "Project Manager", "Engineering Manager"],
    "data": ["Data Scientist", "Data Analyst", "Data Engineer"]
};

// 3. Local AI (Ollama) Logic
async function generateOllamaRoadmap(role: string): Promise<RoadmapResponse> {
      You are a career expert. 
      Review the job title: "${role}".

      CRITICAL VALIDATION STEP:
    1. Is this a REAL, SPECIFIC career or hobby ? (e.g. "Software Engineer" = YES, "Pilot" = YES)
    2. Is it nonsense, random gibberish, or just keyboard smashing ? (e.g. "Dcjknscjd" = NO, "asdf" = NO)
      
      IF "NO"(It is nonsense):
      Return STRICT JSON: { "error": "Invalid role. Please enter a real job title." }
      
      IF "YES"(It is a real role):
      Create a simplified career roadmap in this STRICT JSON format:
    {
        "role": "${role}",
            "root": {
            "id": "root",
                "label": "${role} Roadmap",
                    "duration": "Duration",
                        "children": [
                            {
                                "id": "p1",
                                "label": "Phase 1: Foundations",
                                "duration": "1 Month",
                                "children": [
                                    { "id": "t1", "label": "Key Concept", "duration": "1 Week" }
                                ]
                            },
                            {
                                "id": "p2",
                                "label": "Phase 2: Mastery",
                                "duration": "2 Months",
                                "children": [
                                    { "id": "t2", "label": "Advanced Skills", "duration": "2 Weeks" }
                                ]
                            }
                        ]
        }
    }
    `;

    try {
        console.log("DEBUG: Calling Ollama for", role);
        const response = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt: prompt,
                stream: false,
                format: "json" // CRITICAL: Forces Llama 3 to output JSON only, significantly faster and safer
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${ response.statusText } `);
        }

        const data = await response.json();
        const text = data.response;
        console.log("DEBUG RAW OLLAMA:", text);

        try {
            return JSON.parse(text);
        } catch (parseError) {
            // Llama 3 might include chatter even with json mode sometimes
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw parseError;
        }

    } catch (error: any) {
        console.error("Ollama Critical Error:", error);
        if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
            throw new Error("Ollama is not running. Please run 'ollama run llama3' in your terminal.");
        }
        throw error;
    }
}

// 3. Cloud AI (Gemini) Logic
async function generateGeminiRoadmap(apiKey: string, role: string): Promise<RoadmapResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the experimental model which often has better free-tier availability
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      You are a career expert.I will give you a job title: "${role}".
      
      VALIDATION STEP:
    1. Is "${role}" a real, recognized career or hobby ?
        2. Is it a coherent string(not random letters like "asdf" or "iiii") ?

            IF NO: Return JSON: { "error": "Unknown or invalid role. Please try a specific job title." }
      
      IF YES: Create a detailed career roadmap.
      Return ONLY valid JSON.
        Structure:
    {
        "role": "${role}",
            "root": {
            "id": "root",
                "label": "${role} Roadmap",
                    "duration": "Duration Estimate",
                        "children": [
                            {
                                "id": "unique_id",
                                "label": "Phase Name",
                                "duration": "Duration",
                                "children": [
                                    {
                                        "id": "subtask_id",
                                        "label": "Subtask Name",
                                        "duration": "Duration"
                                    }
                                ]
                            }
                        ]
        }
    }
      Ensure there are at least 3 main phases(Foundations, Advanced, Mastery) and 3 subtasks each.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json / g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
} catch (error) {
    console.error("Gemini Critical Error:", error);
    throw error;
}
}



export async function generateRoadmap(role: string): Promise<RoadmapResponse & { suggestions?: string[]; error?: string }> {
    const cleanRole = role.toLowerCase().trim();

    // Suggestion Logic
    if (cleanRole.length < 4 || (SIMILAR_ROLES[cleanRole] && !cleanRole.includes(" "))) {
        for (const [keyword, suggestions] of Object.entries(SIMILAR_ROLES)) {
            if (cleanRole === keyword) {
                return {
                    role: role,
                    root: { id: "empty", label: "", children: [] },
                    suggestions: suggestions
                };
            }
        }
    }

    // 1. Try Local AI (Ollama) First
    try {
        console.log("DEBUG: Attempting Ollama generation for:", role);
        const result = await generateOllamaRoadmap(role);

        if ((result as any).error) {
            // If Ollama returns a logic error (invalid role), respect it
            return { role: role, root: { id: "error", label: "Invalid", children: [] }, error: (result as any).error };
        }
        return result;

    } catch (e: any) {
        const isConnectionError = e.message.includes("Ollama is not running") || e.message.includes("fetch failed");

        if (!isConnectionError) {
            // If it's a non-connection error (e.g. parsing), fail
            return { role: role, root: { id: "error", label: "Error", children: [] }, error: e.message };
        }

        console.warn("Ollama failed (not running). Falling back to Cloud AI (Gemini)...");
    }

    // 2. Fallback to Cloud AI (Gemini)
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
        try {
            const result = await generateGeminiRoadmap(apiKey, role);
            if ((result as any).error) return { role: role, root: { id: "error", label: "Invalid", children: [] }, error: (result as any).error };
            return result;
        } catch (e: any) {
            console.error("Gemini failed:", e.message);
            // Don't rethrow, let it fall through to the mock
        }
    } else {
        console.warn("No Gemini API key found. Falling back to Enhanced Mock.");
    }

    // 3. Final Fallback: Strict Error (User requested "No Mock")
    console.warn("All AI services failed.");
    return {
        role: role,
        root: { id: "error", label: "Connection Failed", children: [] },
        error: "Offline Model (Ollama) is not running. Please start it to generate roadmaps."
    };
}
