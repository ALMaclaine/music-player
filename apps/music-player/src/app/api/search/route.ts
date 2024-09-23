import { NextResponse } from 'next/server';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

interface SearchResult {
  id: number;
  title: string;
  artist: string;
  album: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchTerm = `%${query}%`;
    const results = db.prepare(`
      SELECT id, title, artist, album
      FROM Songs
      WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
      LIMIT 50
    `).all(searchTerm, searchTerm, searchTerm) as SearchResult[];

    logInfo('Search performed', { query, resultCount: results.length });
    return NextResponse.json(results);
  } catch (error) {
    logError('Error searching songs', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}