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
import { getHorizontalLayout } from '@/lib/horizontalLayout'; // Switched back to Horizontal
import { Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useReactFlow } from 'reactflow';

const nodeTypes = {
    mindMap: MindMapNode,
};

interface RoadmapViewProps {
    data: RoadmapResponse;
}

function RoadmapFlow({ data }: RoadmapViewProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    useEffect(() => {
        if (data && data.root) {
            // Use Horizontal Layout
            const { nodes: layoutedNodes, edges: layoutedEdges } = getHorizontalLayout(data.root);

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

            // Force fit view after a brief render delay to ensure nodes have size
            window.requestAnimationFrame(() => {
                fitView({ padding: 0.1, minZoom: 0.8, maxZoom: 1 }); // Ensure visible size
            });
        }
    }, [data, setNodes, setEdges, fitView]);

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
        <div style={{ width: '100%', height: '85vh' }} className="relative z-0">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                // Interaction Tweaks for "Native Scroll" feel
                panOnScroll={true}         // Scroll wheel pans instead of zooms
                zoomOnScroll={false}       // Disable zoom on scroll
                zoomOnPinch={false}        // Disable pinch zoom
                zoomOnDoubleClick={false}  // Disable double click zoom
                panOnDrag={true}           // Allow dragging to pan
                minZoom={1}                // Lock Zoom
                maxZoom={1}                // Lock Zoom
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                fitView
                fitViewOptions={{ padding: 0.1, minZoom: 0.8, maxZoom: 1 }} // Initial fit only
                attributionPosition="bottom-right"
            >
                {/* Subtle Grid instead of dots for a cleaner drafting look? Or none? keeping dots for reference */}
                <Background color="#D4AF37" gap={24} size={1} style={{ opacity: 0.05 }} />
                <Controls className="!bg-white/80 !border-[#D4AF37]/20 !text-[#AA8C2C] !shadow-sm" />

                <Panel position="top-right" className="flex gap-2">
                    <button onClick={handleExport} className="p-2 bg-white rounded-lg hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/20 text-slate-700 shadow-sm" title="Download Image">
                        <Download size={20} />
                    </button>
                    {/* Add Minimize/Close if needed, but currently this is the main view */}
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
