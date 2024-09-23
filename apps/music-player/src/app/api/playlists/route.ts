import { NextResponse } from 'next/server';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

interface Playlist {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const playlists = db.prepare('SELECT * FROM Playlists WHERE user_id = ?').all(userId) as Playlist[];
    logInfo('Retrieved playlists', { userId, count: playlists.length });
    return NextResponse.json(playlists);
  } catch (error) {
    logError('Error fetching playlists', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('POST request received');
    const body = await req.json();
    console.log('Request body:', body);
    const { userId, name } = body;

    if (!userId || !name) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO Playlists (user_id, name) VALUES (?, ?)');
    console.log('Prepared statement:', stmt);
    const result = stmt.run(userId, name);
    console.log('Insert result:', result);

    if (result.lastInsertRowid) {
      const newPlaylist = db.prepare('SELECT * FROM Playlists WHERE id = ?').get(result.lastInsertRowid) as Playlist;
      console.log('New playlist:', newPlaylist);
      logInfo('Playlist created', { id: newPlaylist.id, userId: newPlaylist.user_id, name: newPlaylist.name });
      return NextResponse.json(newPlaylist, { status: 201 });
    } else {
      console.log('Failed to create playlist');
      throw new Error('Failed to create playlist');
    }
  } catch (error) {
    console.error('Error in POST:', error);
    logError('Error creating playlist', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    console.log('PUT request received');
    const body = await req.json();
    console.log('Request body:', body);
    const { id, name } = body;

    if (!id || !name) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE Playlists SET name = ? WHERE id = ?');
    console.log('Prepared statement:', stmt);
    const result = stmt.run(name, id);
    console.log('Update result:', result);

    if (result.changes === 1) {
      const updatedPlaylist = db.prepare('SELECT * FROM Playlists WHERE id = ?').get(id) as Playlist;
      console.log('Updated playlist:', updatedPlaylist);
      logInfo('Playlist updated', { id: updatedPlaylist.id, name: updatedPlaylist.name });
      return NextResponse.json(updatedPlaylist);
    } else {
      console.log('Playlist not found');
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in PUT:', error);
    logError('Error updating playlist', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    const stmt = db.prepare('DELETE FROM Playlists WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 1) {
      logInfo('Playlist deleted', { id });
      return NextResponse.json({ message: 'Playlist deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
  } catch (error) {
    logError('Error deleting playlist', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}