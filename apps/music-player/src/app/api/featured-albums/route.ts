import { NextResponse } from 'next/server';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

interface Album {
  id: number;
  title: string;
  artist: string;
  cover_image: string;
}

export async function GET() {
  try {
    const featuredAlbums = db.prepare(`
      SELECT DISTINCT a.id, a.title, ar.name as artist, a.cover_image
      FROM Albums a
      JOIN Songs s ON s.album_id = a.id
      JOIN Artists ar ON ar.id = s.artist_id
      ORDER BY RANDOM()
      LIMIT 4
    `).all() as Album[];

    logInfo('Retrieved featured albums', { count: featuredAlbums.length });
    return NextResponse.json(featuredAlbums);
  } catch (error) {
    logError('Error fetching featured albums', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}