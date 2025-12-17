"use client";

import React, { useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Panel,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RoadmapResponse } from '@/lib/types';
import MindMapNode from './MindMapNode';
import { getHorizontalLayout } from '@/lib/horizontalLayout';
import { Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { toPng } from 'html-to-image';

const nodeTypes = {
    mindMap: MindMapNode,
};

interface RoadmapViewProps {
    data: RoadmapResponse;
}

function RoadmapFlow({ data }: RoadmapViewProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (data && data.root) {
            // Use the new Horizontal Layout engine
            const { nodes: layoutedNodes, edges: layoutedEdges } = getHorizontalLayout(data.root);

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [data, setNodes, setEdges]);

    const handleExport = () => {
        const rf = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (rf) {
            toPng(rf, { backgroundColor: '#FAFAF5' }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `career-roadmap-${data.role}.png`;
                link.href = dataUrl;
                link.click();
            });
        }
    };

    return (
        <div style={{ width: '100%', height: '600px' }} className="glass-card rounded-xl overflow-hidden border border-[#D4AF37]/20 shadow-2xl relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#D4AF37" gap={16} size={1} style={{ opacity: 0.1 }} />
                <Controls className="!bg-white/80 !border-[#D4AF37]/20 !text-[#AA8C2C]" />

                <Panel position="top-right" className="flex gap-2">
                    <button onClick={handleExport} className="p-2 bg-white rounded-lg hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/20 text-slate-700 shadow-sm" title="Download Image">
                        <Download size={20} />
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function RoadmapView(props: RoadmapViewProps) {
    return (
        <ReactFlowProvider>
            <RoadmapFlow {...props} />
        </ReactFlowProvider>
    );
}
