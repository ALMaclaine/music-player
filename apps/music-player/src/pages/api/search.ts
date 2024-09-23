import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { withAuth } from '../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const songs = db.prepare(`
      SELECT * FROM Songs
      WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);

    const playlists = db.prepare(`
      SELECT * FROM Playlists
      WHERE name LIKE ?
    `).all(`%${q}%`);

    res.status(200).json({ songs, playlists });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
};

export default withAuth(handler);