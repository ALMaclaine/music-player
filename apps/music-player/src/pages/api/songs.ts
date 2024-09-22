import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getSongs(req, res);
    case 'POST':
      return createSong(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getSongs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const songs = db.prepare('SELECT id, title, artist, album, duration FROM Songs').all();
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Error fetching songs' });
  }
}

function createSong(req: NextApiRequest, res: NextApiResponse) {
  const { title, artist, album, duration, file_path } = req.body;
  if (!title || !artist || !duration || !file_path) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = db.prepare('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)').run(title, artist, album, duration, file_path);
    res.status(201).json({ id: result.lastInsertRowid, title, artist, album, duration });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Error creating song' });
  }
}