import { NextResponse } from 'next/server';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const songs = db.prepare('SELECT * FROM Songs LIMIT ? OFFSET ?').all(limit, offset) as Song[];
    const total = (db.prepare('SELECT COUNT(*) as count FROM Songs').get() as { count: number }).count;

    logInfo('Retrieved songs', { count: songs.length, total, limit, offset });
    return NextResponse.json({
      songs,
      total,
      limit,
      offset
    });
  } catch (error) {
    logError('Error fetching songs', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, album, duration, file_path } = body;

    if (!title || !artist || !duration || !file_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(title, artist, album, duration, file_path);

    if (result.changes === 1) {
      const newSong = db.prepare('SELECT * FROM Songs WHERE id = ?').get(result.lastInsertRowid) as Song;
      logInfo('Song created', { id: newSong.id, title: newSong.title, artist: newSong.artist });
      return NextResponse.json(newSong, { status: 201 });
    } else {
      throw new Error('Failed to create song');
    }
  } catch (error) {
    logError('Error creating song', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Song with this file path already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, artist, album, duration, file_path } = body;

    if (!id || (!title && !artist && !album && !duration && !file_path)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let query = 'UPDATE Songs SET ';
    const params = [];
    if (title) {
      query += 'title = ?, ';
      params.push(title);
    }
    if (artist) {
      query += 'artist = ?, ';
      params.push(artist);
    }
    if (album !== undefined) {
      query += 'album = ?, ';
      params.push(album);
    }
    if (duration) {
      query += 'duration = ?, ';
      params.push(duration);
    }
    if (file_path) {
      query += 'file_path = ?, ';
      params.push(file_path);
    }
    query = query.slice(0, -2); // Remove last comma and space
    query += ' WHERE id = ?';
    params.push(id);

    const result = db.prepare(query).run(...params);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    logInfo('Song updated', { id });
    return NextResponse.json({ message: 'Song updated successfully' });
  } catch (error) {
    logError('Error updating song', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing song id' }, { status: 400 });
    }

    const result = db.prepare('DELETE FROM Songs WHERE id = ?').run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    logInfo('Song deleted', { id });
    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error) {
    logError('Error deleting song', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}