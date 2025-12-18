import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, BookOpen } from 'lucide-react';

const MindMapNode = ({ data, isConnectable }: any) => {
    const { label, duration, index, isRoot, subItems } = data;

    // Root Node (Title Header)
    if (isRoot) {
        return (
            <div className="relative group flex items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="
                relative z-20 px-8 py-4 rounded-full
                bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C]
                border-4 border-white shadow-2xl
                text-white text-xl font-bold uppercase tracking-widest
                pointer-events-auto
            "
                >
                    {label}
                </motion.div>

                {/* Hidden handles for spine */}
                <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" style={{ left: '50%' }} isConnectable={isConnectable} />
            </div>
        );
    }

    // Phase Node (Content Card)
    return (
        <div className="relative group flex items-start gap-6 w-[600px] pointer-events-none">

            {/* 
         Timeline Marker (Left)
         Standardized numbered circle on the spine
      */}
            <div className="absolute left-[30px] top-0 bottom-0 flex flex-col items-center">
                {/* The spine line is drawn by React Flow edges, but we can add a visual anchor */}
            </div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className={`
            relative z-20 flex-shrink-0 w-14 h-14 rounded-full 
            flex items-center justify-center 
            bg-white border-4 border-[#D4AF37] shadow-lg
            text-[#D4AF37] text-xl font-bold pointer-events-auto
        `}
            >
                {index - 1} {/* Start numbering phases at 1 */}
            </motion.div>


            {/* 
         Content Card (Detailed)
      */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className="flex-1 pointer-events-auto"
            >
                <div className={`
            relative overflow-hidden
            rounded-2xl border border-[#D4AF37]/20
            bg-white/95 backdrop-blur-xl shadow-xl
            hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)]
            transition-all duration-300
        `}>
                    {/* Header Section */}
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-[#FFFBF0] to-white">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-slate-800">{label}</h3>
                            {duration && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#AA8C2C] bg-[#D4AF37]/10 px-3 py-1.5 rounded-full whitespace-nowrap">
                                    <Clock size={12} />
                                    <span>{duration}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills List (The "What Skills" part) */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subItems && subItems.length > 0 ? (
                            subItems.map((skill: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-[#D4AF37]/5 transition-colors border border-transparent hover:border-[#D4AF37]/20 group/skill">
                                    <CheckCircle2 size={16} className="text-[#D4AF37] flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-700">{skill.label}</span>
                                    {/* If skill has duration, maybe show it? */}
                                    {skill.duration && <span className="text-[10px] text-slate-400 ml-auto">{skill.duration}</span>}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-sm text-slate-400 italic py-2">
                                Key milestones and concepts
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Handles aligned with the Marker Circle (width 56px -> center 28px) */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-1 !h-1 !bg-transparent !border-0"
                style={{ left: '28px', top: 0 }}
                isConnectable={isConnectable}
            />

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-1 !h-1 !bg-transparent !border-0"
                style={{ left: '28px', bottom: 0 }}
                isConnectable={isConnectable}
            />
        </div>
    );
};

export default memo(MindMapNode);
