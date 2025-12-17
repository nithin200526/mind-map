"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import RoadmapView from "@/components/RoadmapView";
import { RoadmapResponse } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (role: string) => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to generate roadmap");

      const result = await res.json();

      if (result.error) {
        setError(`AI Message: ${result.error}`);
        setData(null);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setError("Failed to generate roadmap. Please check your connection or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#AA8C2C]/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 w-full max-w-6xl">
        <nav className="flex justify-between items-center mb-10 md:mb-20">
          <div className="font-bold text-2xl tracking-tighter flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center text-white shadow-lg">M</span>
            <span className="text-slate-800">CareerMap.AI</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Features</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">About</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Pricing</a>
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {!data && !loading && (
            <>
              <Hero key="hero" onSearch={handleSearch} isLoading={loading} />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute top-24 z-50 px-6 py-4 rounded-xl border shadow-xl flex flex-col gap-2 max-w-lg text-center ${error.includes("Ollama") ? "bg-slate-900 text-white border-slate-700" : "bg-red-50 text-red-600 border-red-200"}`}
                >
                  {error.includes("Ollama") ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="font-bold text-lg">Offline Model Disconnected</h3>
                      </div>
                      <p className="text-slate-300 text-sm mb-4">To use the unlimited integration, you must run the local AI engine.</p>
                      <div className="bg-black/50 p-3 rounded-lg text-left font-mono text-xs text-green-400 mb-2">
                        $ ollama run llama3
                      </div>
                      <a href="https://ollama.com" target="_blank" className="bg-[#D4AF37] text-slate-900 font-bold py-2 rounded-lg hover:bg-[#AA8C2C] transition-colors">
                        Download Ollama Engine
                      </a>
                    </>
                  ) : (
                    <>
                      <span className="font-bold block mb-1">Error</span>
                      <span>{error}</span>
                    </>
                  )}
                </motion.div>
              )}
            </>
          )}

          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-t-4 border-[#D4AF37] rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-t-4 border-[#F3E5AB] rounded-full animate-spin animation-delay-200"></div>
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] animate-pulse">
                Sculpting your path...
              </h2>
            </motion.div>
          )}

          {data && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <button
                    onClick={() => setData(null)}
                    className="text-sm text-slate-500 hover:text-[#AA8C2C] mb-2 flex items-center gap-1 transition-colors"
                  >
                    ← Back to Search
                  </button>
                  {!data.suggestions ? (
                    <h2 className="text-3xl font-bold text-slate-900">
                      Roadmap for <span className="text-gradient-gold capitalize">{data.role}</span>
                    </h2>
                  ) : (
                    <h2 className="text-3xl font-bold text-slate-900">
                      Did you mean...
                    </h2>
                  )}
                </div>
              </div>

              {/* Render Roadmap OR Suggestions */}
              {!data.suggestions ? (
                <>
                  <RoadmapView data={data} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {['Curated Resources', 'Job Market Insights', 'AI Coach'].map((item) => (
                      <div key={item} className="p-4 rounded-xl border border-[#D4AF37]/10 bg-white/60 hover:bg-white/80 transition cursor-pointer shadow-sm hover:shadow-md">
                        <h3 className="font-semibold text-[#AA8C2C] mb-1">{item}</h3>
                        <p className="text-xs text-slate-500">Coming soon</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="p-6 rounded-xl border border-[#D4AF37]/20 bg-white/80 hover:bg-white hover:scale-[1.02] transition-all shadow-md flex items-center gap-4 group text-left"
                    >
                      <div className="p-3 rounded-full bg-[#D4AF37]/10 text-[#AA8C2C] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                        <Lightbulb size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-800 group-hover:text-[#AA8C2C] transition-colors">{suggestion}</h3>
                        <p className="text-slate-500 text-sm">View refined roadmap</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
