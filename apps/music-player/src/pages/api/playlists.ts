import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { withAuth, User } from '../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getPlaylists)(req, res);
    case 'POST':
      return withAuth(createPlaylist)(req, res);
    case 'PUT':
      return withAuth(updatePlaylist)(req, res);
    case 'DELETE':
      return withAuth(deletePlaylist)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getPlaylists(req: NextApiRequest, res: NextApiResponse, user: User) {
  try {
    const playlists = db.prepare('SELECT id, user_id, name FROM Playlists WHERE user_id = ?').all(user.id);
    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
}

async function createPlaylist(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = db.prepare('INSERT INTO Playlists (user_id, name) VALUES (?, ?)').run(user.id, name);
    res.status(201).json({ id: result.lastInsertRowid, user_id: user.id, name });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error creating playlist' });
  }
}

async function updatePlaylist(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { id } = req.query;
  const { name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = db.prepare('UPDATE Playlists SET name = ? WHERE id = ? AND user_id = ?').run(name, id, user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Playlist not found or not owned by user' });
    }
    res.status(200).json({ message: 'Playlist updated successfully' });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Error updating playlist' });
  }
}

async function deletePlaylist(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing playlist id' });
  }

  try {
    const result = db.prepare('DELETE FROM Playlists WHERE id = ? AND user_id = ?').run(id, user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Playlist not found or not owned by user' });
    }
    // Also delete all entries in PlaylistSongs for this playlist
    db.prepare('DELETE FROM PlaylistSongs WHERE playlist_id = ?').run(id);
    res.status(200).json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Error deleting playlist' });
  }
}

export async function getPlaylistSongs(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing playlist id' });
  }

  try {
    const playlist = db.prepare('SELECT id FROM Playlists WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or not owned by user' });
    }

    const songs = db.prepare(`
      SELECT s.id, s.title, s.artist, s.album, s.duration, ps.song_order
      FROM Songs s
      JOIN PlaylistSongs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.song_order
    `).all(id);
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    res.status(500).json({ error: 'Error fetching playlist songs' });
  }
}

export async function addSongToPlaylist(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { playlist_id, song_id } = req.body;
  if (!playlist_id || !song_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const playlist = db.prepare('SELECT id FROM Playlists WHERE id = ? AND user_id = ?').get(playlist_id, user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or not owned by user' });
    }

    const maxOrderResult = db.prepare('SELECT MAX(song_order) as maxOrder FROM PlaylistSongs WHERE playlist_id = ?').get(playlist_id) as { maxOrder: number | null };
    const newOrder = (maxOrderResult.maxOrder || 0) + 1;
    const result = db.prepare('INSERT INTO PlaylistSongs (playlist_id, song_id, song_order) VALUES (?, ?, ?)').run(playlist_id, song_id, newOrder);
    res.status(201).json({ id: result.lastInsertRowid, playlist_id, song_id, song_order: newOrder });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Error adding song to playlist' });
  }
}

export async function removeSongFromPlaylist(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { playlist_id, song_id } = req.query;
  if (!playlist_id || !song_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const playlist = db.prepare('SELECT id FROM Playlists WHERE id = ? AND user_id = ?').get(playlist_id, user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or not owned by user' });
    }

    const result = db.prepare('DELETE FROM PlaylistSongs WHERE playlist_id = ? AND song_id = ?').run(playlist_id, song_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Song not found in playlist' });
    }
    res.status(200).json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Error removing song from playlist' });
  }
}

export async function updatePlaylistSongOrder(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { playlist_id, song_id, new_order } = req.body;
  if (!playlist_id || !song_id || new_order === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const playlist = db.prepare('SELECT id FROM Playlists WHERE id = ? AND user_id = ?').get(playlist_id, user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or not owned by user' });
    }

    const result = db.prepare('UPDATE PlaylistSongs SET song_order = ? WHERE playlist_id = ? AND song_id = ?').run(new_order, playlist_id, song_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Song not found in playlist' });
    }
    res.status(200).json({ message: 'Playlist song order updated successfully' });
  } catch (error) {
    console.error('Error updating playlist song order:', error);
    res.status(500).json({ error: 'Error updating playlist song order' });
  }
}