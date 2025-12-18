import { Node, Edge } from 'reactflow';
import { RoadmapNode } from './types';

// Configuration
const Y_SPACING = 300; // More space for taller cards with skills

export const getTimelineLayout = (
    dataRoot: RoadmapNode
): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // We only want to map the PRIMARY path: Root -> Phases.
    // Sub-tasks (Skills) will be embedded IN the Phase Node, not as separate nodes.

    const sequence: RoadmapNode[] = [];

    // 1. Root
    sequence.push(dataRoot);

    // 2. Main Phases (Direct children of root)
    if (dataRoot.children) {
        dataRoot.children.forEach(phase => sequence.push(phase));
    }

    // 3. Position Nodes
    sequence.forEach((item, index) => {
        const x = 0;
        const y = index * Y_SPACING;

        // Pass the children (Skills) to the node data
        // For Root, its children are Phases (we handle them separately, so maybe don't pass them to render inside Root)
        // For Phases, their children are Skills (we WANT to render these)
        const subItems = (index === 0) ? [] : (item.children || []);

        nodes.push({
            id: item.id,
            position: { x, y },
            data: {
                label: item.label,
                duration: item.duration,
                index: index + 1,
                isRoot: index === 0,
                subItems: subItems // <-- CRITICAL: Passing skills to be rendered inside the card
            },
            type: 'mindMap',
        });

        // 4. Edges (Spine)
        if (index > 0) {
            const prevNode = sequence[index - 1];
            edges.push({
                id: `e-${prevNode.id}-${item.id}`,
                source: prevNode.id,
                target: item.id,
                type: 'straight',
                animated: false,
                style: {
                    stroke: '#D4AF37',
                    strokeWidth: 4,
                    opacity: 0.5
                },
            });
        }
    });

    return { nodes, edges };
};
