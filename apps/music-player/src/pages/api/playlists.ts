import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { withAuth } from '../../lib/auth';
import { asyncHandler, AppError, logInfo, logError } from '../../lib/errorHandler';

const handler = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return getPlaylists(req, res);
    case 'POST':
      return createPlaylist(req, res);
    case 'PUT':
      return updatePlaylist(req, res);
    case 'DELETE':
      return deletePlaylist(req, res);
    default:
      logError('Method not allowed', { method: req.method });
      throw new AppError('Method not allowed', 405);
  }
});

const getPlaylists = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const playlists = db.prepare('SELECT * FROM Playlists').all();
  logInfo('Retrieved all playlists', { count: playlists.length });
  res.status(200).json(playlists);
});

const createPlaylist = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, description } = req.body;

  if (!name) {
    logError('Playlist creation failed', { reason: 'Missing name' });
    throw new AppError('Playlist name is required', 400);
  }

  const result = db.prepare('INSERT INTO Playlists (name, description) VALUES (?, ?)').run(name, description);

  logInfo('Playlist created', { id: result.lastInsertRowid, name });
  res.status(201).json({
    id: result.lastInsertRowid,
    name,
    description,
  });
});

const updatePlaylist = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { name, description } = req.body;

  if (!id || typeof id !== 'string') {
    logError('Playlist update failed', { reason: 'Invalid ID', id });
    throw new AppError('Invalid playlist ID', 400);
  }

  if (!name) {
    logError('Playlist update failed', { reason: 'Missing name', id });
    throw new AppError('Playlist name is required', 400);
  }

  const result = db.prepare('UPDATE Playlists SET name = ?, description = ? WHERE id = ?').run(name, description, id);

  if (result.changes === 0) {
    logError('Playlist update failed', { reason: 'Playlist not found', id });
    throw new AppError('Playlist not found', 404);
  }

  logInfo('Playlist updated', { id, name });
  res.status(200).json({ message: 'Playlist updated successfully' });
});

const deletePlaylist = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    logError('Playlist deletion failed', { reason: 'Invalid ID', id });
    throw new AppError('Invalid playlist ID', 400);
  }

  const result = db.prepare('DELETE FROM Playlists WHERE id = ?').run(id);

  if (result.changes === 0) {
    logError('Playlist deletion failed', { reason: 'Playlist not found', id });
    throw new AppError('Playlist not found', 404);
  }

  logInfo('Playlist deleted', { id });
  res.status(200).json({ message: 'Playlist deleted successfully' });
});

export const getPlaylistSongs = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    logError('Get playlist songs failed', { reason: 'Invalid ID', id });
    throw new AppError('Invalid playlist ID', 400);
  }

  const songs = db.prepare(`
    SELECT s.* FROM Songs s
    JOIN PlaylistSongs ps ON s.id = ps.song_id
    WHERE ps.playlist_id = ?
    ORDER BY ps.order
  `).all(id);

  logInfo('Retrieved playlist songs', { playlistId: id, songCount: songs.length });
  res.status(200).json(songs);
});

export const addSongToPlaylist = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { playlistId, songId } = req.body;

  if (!playlistId || !songId) {
    logError('Add song to playlist failed', { reason: 'Missing IDs', playlistId, songId });
    throw new AppError('Playlist ID and Song ID are required', 400);
  }

  const maxOrderResult = db.prepare('SELECT MAX("order") as maxOrder FROM PlaylistSongs WHERE playlist_id = ?').get(playlistId) as { maxOrder: number | null };
  const newOrder = (maxOrderResult.maxOrder ?? 0) + 1;

  db.prepare('INSERT INTO PlaylistSongs (playlist_id, song_id, "order") VALUES (?, ?, ?)').run(playlistId, songId, newOrder);

  logInfo('Song added to playlist', { playlistId, songId, order: newOrder });
  res.status(200).json({ message: 'Song added to playlist successfully' });
});

export const removeSongFromPlaylist = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { playlistId, songId } = req.body;

  if (!playlistId || !songId) {
    logError('Remove song from playlist failed', { reason: 'Missing IDs', playlistId, songId });
    throw new AppError('Playlist ID and Song ID are required', 400);
  }

  const result = db.prepare('DELETE FROM PlaylistSongs WHERE playlist_id = ? AND song_id = ?').run(playlistId, songId);

  if (result.changes === 0) {
    logError('Remove song from playlist failed', { reason: 'Song not found in playlist', playlistId, songId });
    throw new AppError('Song not found in playlist', 404);
  }

  logInfo('Song removed from playlist', { playlistId, songId });
  res.status(200).json({ message: 'Song removed from playlist successfully' });
});

export const updatePlaylistSongOrder = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { playlistId, songOrder } = req.body;

  if (!playlistId || !songOrder || !Array.isArray(songOrder)) {
    logError('Update playlist song order failed', { reason: 'Invalid input', playlistId, songOrder });
    throw new AppError('Invalid input', 400);
  }

  const updateStmt = db.prepare('UPDATE PlaylistSongs SET "order" = ? WHERE playlist_id = ? AND song_id = ?');

  db.transaction(() => {
    songOrder.forEach((songId, index) => {
      updateStmt.run(index + 1, playlistId, songId);
    });
  })();

  logInfo('Playlist song order updated', { playlistId, songCount: songOrder.length });
  res.status(200).json({ message: 'Playlist song order updated successfully' });
});

export default withAuth(handler);