import { NextResponse } from 'next/server';
import { generateRoadmap } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const { role } = await request.json();

        if (!role) {
            return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }

        const data = await generateRoadmap(role);
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
    }
}
