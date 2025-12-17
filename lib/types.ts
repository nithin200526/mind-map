export interface RoadmapNode {
    id: string;
    label: string;
    duration?: string;
    description?: string;
    children?: RoadmapNode[];
}

export interface RoadmapResponse {
    role: string;
    root: RoadmapNode;
    suggestions?: string[];
    error?: string; // New field for validation errors
}
