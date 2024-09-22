import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getPlaylists(req, res);
    case 'POST':
      return createPlaylist(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getPlaylists(req: NextApiRequest, res: NextApiResponse) {
  try {
    const playlists = db.prepare('SELECT id, user_id, name FROM Playlists').all();
    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
}

function createPlaylist(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, name } = req.body;
  if (!user_id || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = db.prepare('INSERT INTO Playlists (user_id, name) VALUES (?, ?)').run(user_id, name);
    res.status(201).json({ id: result.lastInsertRowid, user_id, name });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error creating playlist' });
  }
}

// Additional function to get songs in a playlist
export function getPlaylistSongs(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing playlist id' });
  }

  try {
    const songs = db.prepare(`
      SELECT s.id, s.title, s.artist, s.album, s.duration
      FROM Songs s
      JOIN PlaylistSongs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.order
    `).all(id);
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    res.status(500).json({ error: 'Error fetching playlist songs' });
  }
}