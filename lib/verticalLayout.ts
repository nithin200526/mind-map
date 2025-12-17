import { Node, Edge } from 'reactflow';
import { RoadmapNode } from './types';

// Configuration
const Y_SPACING = 220; // Increased spacing for larger cards
// No X_OFFSET needed for single column

export const getVerticalLayout = (
    dataRoot: RoadmapNode
): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const sequence: RoadmapNode[] = [];

    // 1. Flatten the tree into a linear sequence (Depth-First Traversal)
    const traverse = (node: RoadmapNode) => {
        sequence.push(node);
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    };
    traverse(dataRoot);

    // 2. Position nodes in a Single Vertical Stack
    sequence.forEach((item, index) => {
        // Root is always center top
        if (index === 0) {
            nodes.push({
                id: item.id,
                position: { x: 0, y: 0 },
                data: {
                    label: item.label,
                    duration: item.duration,
                    index: index + 1, // For numbering
                    isRoot: true
                },
                type: 'mindMap',
            });
            return;
        }

        // Single Column Stack
        // Simple top-down list, centered
        const x = 0;
        const y = index * Y_SPACING;

        nodes.push({
            id: item.id,
            position: { x, y },
            data: {
                label: item.label,
                duration: item.duration,
                index: index + 1,
                isRoot: false
            },
            type: 'mindMap',
        });

        // 3. Create Hidden Edge (For logical structure but no "wiring")
        const prevNode = sequence[index - 1];
        edges.push({
            id: `e-${prevNode.id}-${item.id}`,
            source: prevNode.id,
            target: item.id,
            type: 'default',
            animated: false,
            hidden: true, // HIDE THE WIRING
        });
    });

    return { nodes, edges };
};
