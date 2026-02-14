import { NextResponse } from 'next/server';
import { getFileTree } from '@/lib/notes';

export async function GET() {
  try {
    const tree = await getFileTree();
    return NextResponse.json(tree);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load file tree' }, { status: 500 });
  }
}
