import { NextApiRequest, NextApiResponse } from 'next';
import handler, { getPlaylistSongs, addSongToPlaylist, removeSongFromPlaylist, updatePlaylistSongOrder } from './playlists';
import db from '../../lib/db/db';

const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

jest.mock('../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnValue({
    all: jest.fn(),
    run: jest.fn(),
    get: jest.fn(),
  }),
  transaction: jest.fn((fn) => fn),
}));

jest.mock('../../lib/auth', () => ({
  withAuth: jest.fn((handler) => handler),
}));

describe('Playlists API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      query: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('GET /api/playlists', () => {
    it('should return all playlists', async () => {
      const mockPlaylists = [{ id: 1, name: 'Test Playlist' }];
      (db.prepare('').all as jest.Mock).mockReturnValue(mockPlaylists);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM Playlists');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockPlaylists);
    });
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      mockReq.method = 'POST';
      mockReq.body = { name: 'New Playlist', description: 'Test description' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ lastInsertRowid: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Playlists (name, description) VALUES (?, ?)');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 1,
        name: 'New Playlist',
        description: 'Test description',
      });
    });

    it('should return 400 if playlist name is missing', async () => {
      mockReq.method = 'POST';
      mockReq.body = {};

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Playlist name is required' });
    });
  });

  describe('PUT /api/playlists', () => {
    it('should update a playlist', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = { name: 'Updated Playlist', description: 'Updated description' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('UPDATE Playlists SET name = ?, description = ? WHERE id = ?');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Playlist updated successfully' });
    });

    it('should return 404 if playlist is not found', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '999' };
      mockReq.body = { name: 'Updated Playlist', description: 'Updated description' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 0 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Playlist not found' });
    });
  });

  describe('DELETE /api/playlists', () => {
    it('should delete a playlist', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Playlists WHERE id = ?');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Playlist deleted successfully' });
    });

    it('should return 404 if playlist is not found', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '999' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 0 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Playlist not found' });
    });
  });

  describe('GET /api/playlists/songs', () => {
    it('should return songs for a playlist', async () => {
      mockReq.query = { id: '1' };
      const mockSongs = [{ id: 1, title: 'Test Song' }];
      (db.prepare('').all as jest.Mock).mockReturnValue(mockSongs);

      await getPlaylistSongs(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT s.* FROM Songs s'));
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('POST /api/playlists/songs', () => {
    it('should add a song to a playlist', async () => {
      mockReq.body = { playlistId: 1, songId: 1 };
      (db.prepare('').get as jest.Mock).mockReturnValue({ maxOrder: 2 });

      await addSongToPlaylist(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO PlaylistSongs'));
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song added to playlist successfully' });
    });
  });

  describe('DELETE /api/playlists/songs', () => {
    it('should remove a song from a playlist', async () => {
      mockReq.body = { playlistId: 1, songId: 1 };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await removeSongFromPlaylist(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM PlaylistSongs WHERE playlist_id = ? AND song_id = ?');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song removed from playlist successfully' });
    });
  });

  describe('PUT /api/playlists/songs/order', () => {
    it('should update the order of songs in a playlist', async () => {
      mockReq.body = { playlistId: 1, songOrder: [3, 1, 2] };

      await updatePlaylistSongOrder(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('UPDATE PlaylistSongs SET "order" = ? WHERE playlist_id = ? AND song_id = ?');
      expect(db.transaction).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Playlist song order updated successfully' });
    });
  });
});