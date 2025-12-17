import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, ChevronDown } from 'lucide-react';

interface MindMapNodeProps {
    data: {
        label: string;
        duration?: string;
        isExpanded?: boolean;
        onToggle?: () => void;
        hasChildren?: boolean;
    };
    isConnectable: boolean;
}

const MindMapNode = ({ data, isConnectable }: MindMapNodeProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card min-w-[240px] rounded-xl p-4 border border-[#D4AF37]/30 backdrop-blur-md bg-white/90 text-slate-800 shadow-xl hover:shadow-[#D4AF37]/20 transition-all"
        >
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-[#D4AF37] !w-3 !h-3 !border-white" />

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800">
                        {data.label}
                    </h3>
                    {data.hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (data.onToggle) data.onToggle();
                            }}
                            className="p-1 rounded-full hover:bg-slate-100 text-[#D4AF37] transition-colors"
                        >
                            {data.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                </div>

                {data.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-[#AA8C2C] bg-[#F3E5AB]/50 px-2 py-1 rounded-md w-fit font-medium">
                        <Clock size={12} />
                        <span>{data.duration}</span>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-[#AA8C2C] !w-3 !h-3 !border-white" />
        </motion.div>
    );
};

export default memo(MindMapNode);
