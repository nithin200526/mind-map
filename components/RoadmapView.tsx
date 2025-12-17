"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    addEdge,
    Connection,
    Panel,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RoadmapResponse, RoadmapNode } from '@/lib/types';
import MindMapNode from './MindMapNode';
import { getLayoutedElements } from '@/lib/layout';
import { Download, Share2, CornerDownRight } from 'lucide-react';
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
    const { fitView } = useReactFlow();

    // Transform recursive data to flat nodes/edges
    const processData = useCallback((root: RoadmapNode) => {
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];

        const traverse = (node: RoadmapNode, parentId?: string) => {
            initialNodes.push({
                id: node.id,
                type: 'mindMap',
                data: {
                    label: node.label,
                    duration: node.duration,
                    hasChildren: !!node.children?.length,
                    isExpanded: true, // Default expanded
                },
                position: { x: 0, y: 0 },
            });

            if (parentId) {
                initialEdges.push({
                    id: `${parentId}-${node.id}`,
                    source: parentId,
                    target: node.id,
                    animated: true,
                    style: { stroke: '#D4AF37', strokeWidth: 2 },
                    type: 'smoothstep',
                });
            }

            if (node.children) {
                node.children.forEach(child => traverse(child, node.id));
            }
        };

        traverse(root);
        return { initialNodes, initialEdges };
    }, []);

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        // Find children and toggle visibility
        if (!node.data.hasChildren) return;

        const isExpanded = !node.data.isExpanded;

        // Update the clicked node's expanded state
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return { ...n, data: { ...n.data, isExpanded } };
                }
                return n;
            })
        );

        // find all descendants
        const findDescendants = (parentId: string, currentEdges: Edge[]): string[] => {
            const children = currentEdges.filter(e => e.source === parentId).map(e => e.target);
            let descendants = [...children];
            children.forEach(childId => {
                descendants = [...descendants, ...findDescendants(childId, currentEdges)];
            });
            return descendants;
        };

        const descendants = findDescendants(node.id, edges);

        setNodes((nds) =>
            nds.map((n) => {
                if (descendants.includes(n.id)) {
                    return {
                        ...n,
                        hidden: !isExpanded,
                        // If we are collapsing, we might want to collapse children too? 
                        // For now, let's just hide them.
                    };
                }
                return n;
            })
        );

        // Re-layout is usually needed if we want to close gaps, but simple hiding works for now.
        // For a "wow" effect, we should probably re-run dagre only on visible nodes?
        // Let's rely on simple hiding first.
    }, [edges, setNodes]);


    // Initial Layout
    useEffect(() => {
        if (data?.root) {
            const { initialNodes, initialEdges } = processData(data.root);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                initialNodes,
                initialEdges
            );

            // Add onToggle handler to data
            const interactiveNodes = layoutedNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    onToggle: () => { /* Handled via onNodeClick for now */ }
                }
            }));

            setNodes(interactiveNodes);
            setEdges(layoutedEdges);

            setTimeout(() => fitView(), 100);
        }
    }, [data, processData, setNodes, setEdges, fitView]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

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
        <div className="w-full h-[600px] md:h-[800px] border border-[#D4AF37]/20 rounded-2xl overflow-hidden glass shadow-2xl relative bg-[#FAFAF5]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#FAFAF5]"
            >
                <Background color="#D4AF37" gap={24} size={1} className="opacity-10" />
                <Controls className="bg-white border-[#D4AF37]/20 text-slate-600 fill-slate-600" />
                <Panel position="top-right" className="flex gap-2">
                    <button onClick={handleExport} className="p-2 bg-white rounded-lg hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/20 text-slate-700 shadow-sm">
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
