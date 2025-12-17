import { Node, Edge } from 'reactflow';
import { RoadmapNode } from './types';

// Configuration
const X_SPACING = 300; // Horizontal distance between steps
const Y_OFFSET = 0;    // All on same Y-axis for the main line

export const getHorizontalLayout = (
    dataRoot: RoadmapNode
): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const sequence: RoadmapNode[] = [];

    // 1. Flatten the tree into a linear sequence
    const traverse = (node: RoadmapNode) => {
        sequence.push(node);
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    };
    traverse(dataRoot);

    // 2. Position nodes horizontally
    sequence.forEach((item, index) => {
        const x = index * X_SPACING;
        const y = 0;

        nodes.push({
            id: item.id,
            position: { x, y },
            data: {
                label: item.label,
                duration: item.duration,
                index: index + 1,
                isRoot: index === 0,
                // Pass sub-items (children) as details if any, 
                // though in this flat sequence, 'children' usually become next steps.
                // For the "Detail Box" look, we might want to treat leaf nodes differently?
                // For now, let's assume the flat sequence IS the timeline.
            },
            type: 'mindMap',
        });

        // 3. Create Edge (Thick Horizontal Line)
        if (index > 0) {
            const prevNode = sequence[index - 1];
            edges.push({
                id: `e-${prevNode.id}-${item.id}`,
                source: prevNode.id,
                target: item.id,
                type: 'straight', // Straight line for the "Bar" effect
                animated: false,
                style: {
                    stroke: '#D4AF37',
                    strokeWidth: 8, // Thick bar like the image
                    opacity: 1
                },
            });
        }
    });

    return { nodes, edges };
};
