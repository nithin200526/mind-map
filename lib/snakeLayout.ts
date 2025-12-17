import { Node, Edge, Position } from 'reactflow';
import { RoadmapNode } from './types';

// Configuration for the grid
const X_SPACING = 350; // Horizontal distance between nodes
const Y_SPACING = 200; // Vertical distance between rows
const NODES_PER_ROW = 4; // How many nodes before dropping to next line

export const getSnakeLayout = (
    dataRoot: RoadmapNode
): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 1. Flatten the tree into a linear sequence
    // We want a guided path: Root -> Phase 1 -> P1-Tasks -> Phase 2 -> P2-Tasks...
    const sequence: RoadmapNode[] = [];

    const traverse = (node: RoadmapNode) => {
        sequence.push(node);
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    };

    traverse(dataRoot);

    // 2. Position nodes in a Snake (Zig-Zag) pattern
    sequence.forEach((item, index) => {
        const row = Math.floor(index / NODES_PER_ROW);
        const colRaw = index % NODES_PER_ROW;

        // Zig-Zag logic: Even rows L->R, Odd rows R->L
        const isEvenRow = row % 2 === 0;
        const col = isEvenRow ? colRaw : (NODES_PER_ROW - 1 - colRaw);

        const x = col * X_SPACING;
        const y = row * Y_SPACING;

        nodes.push({
            id: item.id,
            position: { x, y },
            data: {
                label: item.label,
                duration: item.duration,
                // Helper to know connection points for potential custom edges
                isReverse: !isEvenRow
            },
            // Styling tweak for root vs phases vs tasks could go here
            type: 'mindMap',
        });

        // 3. Create Edge to the NEXT node in sequence (Path connection)
        if (index > 0) {
            const prevNode = nodes[index - 1];
            edges.push({
                id: `e-${prevNode.id}-${item.id}`,
                source: prevNode.id,
                target: item.id,
                type: 'smoothstep', // Gives the right-angle flow
                animated: true,
                style: { stroke: '#D4AF37', strokeWidth: 2, strokeDasharray: '5,5' },
            });
        }
    });

    return { nodes, edges };
};
