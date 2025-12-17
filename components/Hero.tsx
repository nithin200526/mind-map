import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Search } from 'lucide-react';

interface HeroProps {
    onSearch: (role: string) => void;
    isLoading: boolean;
}

const SUGGESTIONS = [
    "AI Engineer", "Software Developer", "YouTuber",
    "Data Scientist", "Product Manager", "Indie Hacker",
    "UX Designer", "Blockchain Developer"
];

export default function Hero({ onSearch, isLoading }: HeroProps) {
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filtered, setFiltered] = useState(SUGGESTIONS);

    useEffect(() => {
        setFiltered(SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase())));
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#AA8C2C] text-sm mb-6 animate-pulse font-medium">
                    <Sparkles size={14} />
                    <span>AI-Powered Career Architect</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900">
                    Design Your <span className="text-gradient-gold">Masterpiece</span>
                </h1>

                <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                    Enter your dream role and let our AI sculpt a personalized, golden path to your success.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto w-full group">
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-[#AA8C2C]" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="e.g. AI Engineer, YouTuber..."
                            className="w-full glass bg-white/60 text-slate-800 rounded-full py-4 pl-12 pr-14 text-lg border-white/40 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query}
                            className="absolute right-2 p-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] hover:opacity-90 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showSuggestions && filtered.length > 0 && query.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white/90 border border-[#D4AF37]/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-50 text-left"
                            >
                                {filtered.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => { setQuery(suggestion); onSearch(suggestion); }}
                                        className="w-full px-6 py-3 hover:bg-[#D4AF37]/10 text-slate-700 hover:text-[#AA8C2C] transition-colors flex items-center justify-between group/item"
                                    >
                                        {suggestion}
                                        <ArrowRight size={14} className="opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all text-[#D4AF37]" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </motion.div>
        </div>
    );
}
