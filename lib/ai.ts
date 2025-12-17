import { GoogleGenerativeAI } from "@google/generative-ai";
import { RoadmapResponse } from "./types";

// Helper: Simple fuzzy match for suggestions (Client-side logic optimization)
const SIMILAR_ROLES: Record<string, string[]> = {
    "developer": ["Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"],
    "designer": ["UX Designer", "UI Designer", "Graphic Designer", "Product Designer"],
    "manager": ["Product Manager", "Project Manager", "Engineering Manager"],
    "data": ["Data Scientist", "Data Analyst", "Data Engineer"]
};

// 3. Real Gemini Logic
async function generateGeminiRoadmap(apiKey: string, role: string): Promise<RoadmapResponse> {
    console.log("DEBUG: generateGeminiRoadmap called with key length:", apiKey?.length);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Updated to gemini-2.0-flash as it is the available model for this key
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
          You are a career expert. I will give you a job title: "${role}".
          
          VALIDATION STEP:
          1. Is "${role}" a real, recognized career or hobby?
          2. Is it a coherent string (not random letters like "asdf" or "iiii")?
          
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
                    { "id": "subtask_id", "label": "Subtask Name", "duration": "Duration" }
                  ]
                }
              ]
            }
          }
          Ensure there are at least 3 main phases (Foundations, Advanced, Mastery) and 3 subtasks each.
        `;

        console.log("DEBUG: Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean markdown code blocks if present
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("DEBUG RAW GEMINI RESPONSE:", text); // Log the raw output
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Critical Error:", error);
        // Throwing here allows the caller to catch and decide, 
        // OR we can return a formatted error object if that fits better.
        // Let's throw to let the caller handle the fallback/error message.
        throw error;
    }
}


export async function generateRoadmap(role: string): Promise<RoadmapResponse & { suggestions?: string[]; error?: string }> {
    const cleanRole = role.toLowerCase().trim();

    // Suggestion Logic (Keep this for better UX on vague terms like "data")
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

    // Real AI (Gemini) ONLY
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        return {
            role: role,
            root: { id: "error", label: "No API Key", children: [] },
            error: "API Key missing. Please configure NEXT_PUBLIC_GEMINI_API_KEY."
        };
    }

    try {
        console.log("DEBUG: Attempting Gemini generation for:", role);
        const result = await generateGeminiRoadmap(apiKey, role);

        // Handle AI Validation Error found in the JSON response
        if ((result as any).error) {
            return {
                role: role,
                root: { id: "error", label: "Invalid Role", children: [] },
                error: (result as any).error
            };
        }

        return result;
    } catch (e: any) {
        console.error("AI Generation Failed:", e);
        // Return a structured error response instead of throwing, so the UI can display it
        return {
            role: role,
            root: { id: "error", label: "Generation Failed", children: [] },
            error: "Gemini API failed. Cause: " + (e.message || "Unknown Error")
        };
    }
}
