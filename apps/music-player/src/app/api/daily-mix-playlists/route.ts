import { NextResponse } from 'next/server';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

interface Playlist {
  id: number;
  name: string;
  cover_image: string;
}

export async function GET() {
  try {
    const dailyMix = db.prepare(`
      SELECT p.id, p.name, a.cover_image
      FROM Playlists p
      JOIN PlaylistSongs ps ON p.id = ps.playlist_id
      JOIN Songs s ON ps.song_id = s.id
      JOIN Albums a ON s.album_id = a.id
      WHERE p.name LIKE 'Daily Mix%'
      GROUP BY p.id
      ORDER BY RANDOM()
      LIMIT 6
    `).all() as Playlist[];

    const userPlaylists = db.prepare(`
      SELECT p.id, p.name, a.cover_image
      FROM Playlists p
      JOIN PlaylistSongs ps ON p.id = ps.playlist_id
      JOIN Songs s ON ps.song_id = s.id
      JOIN Albums a ON s.album_id = a.id
      WHERE p.name NOT LIKE 'Daily Mix%'
      GROUP BY p.id
      ORDER BY RANDOM()
      LIMIT 10
    `).all() as Playlist[];

    logInfo('Retrieved daily mix and playlists', { 
      dailyMixCount: dailyMix.length, 
      playlistsCount: userPlaylists.length 
    });

    return NextResponse.json({ dailyMix, userPlaylists });
  } catch (error) {
    logError('Error fetching daily mix and playlists', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}