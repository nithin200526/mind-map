import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const nodeWidth = 260;
    const nodeHeight = 80;

    dagreGraph.setGraph({
        rankdir: 'LR',
        ranksep: 100, // Increase horizontal distance for timeline feel
        nodesep: 40   // Vertical distance between siblings
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;

        // Shift to top-left anchor
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};
