import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const MindMapNode = ({ data, isConnectable }: any) => {
    const { label, duration, index, isRoot } = data;

    return (
        <div className="relative group w-[280px] flex flex-col items-center justify-start pointer-events-none">

            {/* 
         THE TIMELINE CIRCLE 
         This sits exactly on the 0-Y axis where the edges connect.
         We treat this as the "Node Body" for React Flow positioning.
      */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className={`
            relative z-20 w-16 h-16 rounded-full 
            flex items-center justify-center 
            bg-gradient-to-br from-[#D4AF37] to-[#0ea5e9]
            border-4 border-white shadow-xl
            text-white text-2xl font-bold pointer-events-auto
            ${isRoot ? 'ring-4 ring-[#D4AF37]/30 scale-110' : ''}
        `}
            >
                {index}
            </motion.div>

            {/* 
         CONTENT CARD (Hanging Below) 
         Matches the reference image structure: Title -> Detail Box
      */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="mt-4 flex flex-col items-center text-center w-full pointer-events-auto"
            >
                {/* Title */}
                <div className="text-lg font-bold text-slate-800 leading-tight mb-3 px-2">
                    {label}
                </div>

                {/* Detail Box (The "Green Box" in reference) */}
                <div className={`
            w-full p-4 rounded-xl
            bg-[#D4AF37]/10 border border-[#D4AF37]/20
            backdrop-blur-sm
            flex flex-col gap-2 items-center
            shadow-sm hover:shadow-md transition-shadow
        `}>
                    {duration && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#AA8C2C] bg-white/80 px-2 py-1 rounded-md">
                            <Clock size={12} />
                            <span>{duration}</span>
                        </div>
                    )}

                    {/* Placeholder description text to match the "dense text" look of the reference card if needed, 
                or just keep it clean with the label/duration for now. */}
                    <div className="text-[10px] text-slate-500 leading-relaxed max-w-[90%]">
                        Key phase in your career journey. Master these skills to progress.
                    </div>
                </div>
            </motion.div>

            {/* 
         HANDLES (Centered in the Circle) 
         Use Left/Right handles for the horizontal chain.
      */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-1 !h-1 !bg-transparent !border-0 top-8" // top-8 represents center of 16 (4rem = 64px) height circle?? No, default is 50%.
                style={{ top: '32px' }} // 32px is center of 64px circle
                isConnectable={isConnectable}
            />

            <Handle
                type="source"
                position={Position.Right}
                className="!w-1 !h-1 !bg-transparent !border-0"
                style={{ top: '32px' }}
                isConnectable={isConnectable}
            />
        </div>
    );
};

export default memo(MindMapNode);
