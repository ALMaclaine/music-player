import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { withAuth } from '../../lib/auth';
import { asyncHandler, AppError, logInfo, logError } from '../../lib/errorHandler';

const handler = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    logError('Invalid method for search', { method: req.method });
    throw new AppError('Method not allowed', 405);
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    logError('Invalid search query', { query: q });
    throw new AppError('Search query is required', 400);
  }

  logInfo('Performing search', { query: q });

  const songs = db.prepare(`
    SELECT * FROM Songs
    WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
  `).all(`%${q}%`, `%${q}%`, `%${q}%`);

  const playlists = db.prepare(`
    SELECT * FROM Playlists
    WHERE name LIKE ?
  `).all(`%${q}%`);

  logInfo('Search completed', { 
    query: q, 
    songsFound: songs.length, 
    playlistsFound: playlists.length 
  });

  res.status(200).json({ songs, playlists });
});

export default withAuth(handler);