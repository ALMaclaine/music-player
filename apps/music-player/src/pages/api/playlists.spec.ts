import { NextApiRequest, NextApiResponse } from 'next';
import handler, { getPlaylistSongs, addSongToPlaylist, removeSongFromPlaylist, updatePlaylistSongOrder } from './playlists';
import db from '../../lib/db/db';
import { User } from '../../lib/auth';

jest.mock('../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  all: jest.fn(),
  run: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../../lib/auth', () => ({
  withAuth: (handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) => 
    (req: NextApiRequest, res: NextApiResponse) => 
      handler(req, res, { id: 1, username: 'testuser', email: 'test@example.com' }),
}));

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
};

describe('Playlists API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockUser: User;

  beforeEach(() => {
    mockReq = {
      method: '',
      query: {},
      body: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
      setHeader: jest.fn(),
    };
    mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    jest.clearAllMocks();
  });

  describe('GET /api/playlists', () => {
    it('should get all playlists for the user', async () => {
      const mockPlaylists = [
        { id: 1, user_id: 1, name: 'Playlist 1' },
        { id: 2, user_id: 1, name: 'Playlist 2' },
      ];
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockPlaylists);

      mockReq.method = 'GET';
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id, user_id, name FROM Playlists WHERE user_id = ?');
      expect(db.prepare('').all).toHaveBeenCalledWith(mockUser.id);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockPlaylists);
    });
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      const newPlaylist = { name: 'New Playlist' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ lastInsertRowid: 3 });

      mockReq.method = 'POST';
      mockReq.body = newPlaylist;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Playlists (user_id, name) VALUES (?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(mockUser.id, newPlaylist.name);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          user_id: mockUser.id,
          name: newPlaylist.name,
        })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.method = 'POST';
      mockReq.body = {}; // Missing 'name'
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });
  });

  describe('PUT /api/playlists', () => {
    it('should update an existing playlist', async () => {
      const updatedPlaylist = { name: 'Updated Playlist' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = updatedPlaylist;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('UPDATE Playlists SET name = ? WHERE id = ? AND user_id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith(updatedPlaylist.name, '1', mockUser.id);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Playlist updated successfully' });
    });

    it('should return 404 when updating non-existent playlist', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '999' };
      mockReq.body = { name: 'Nonexistent Playlist' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Playlist not found or not owned by user' });
    });
  });

  describe('DELETE /api/playlists', () => {
    it('should delete a playlist', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Playlists WHERE id = ? AND user_id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1', mockUser.id);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Playlist deleted successfully' });
    });

    it('should return 404 when deleting non-existent playlist', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '999' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Playlist not found or not owned by user' });
    });
  });

  it('should return 405 for invalid request method', async () => {
    mockReq.method = 'PATCH';
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.METHOD_NOT_ALLOWED);
    expect(mockRes.end).toHaveBeenCalledWith('Method PATCH Not Allowed');
  });

  describe('GET /api/playlists/songs', () => {
    it('should get songs for a playlist', async () => {
      const mockSongs = [
        { id: 1, title: 'Song 1', artist: 'Artist 1', album: 'Album 1', duration: 180, song_order: 1 },
        { id: 2, title: 'Song 2', artist: 'Artist 2', album: 'Album 2', duration: 240, song_order: 2 },
      ];
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 1 });
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockSongs);

      mockReq.method = 'GET';
      mockReq.query = { id: '1' };
      await getPlaylistSongs(mockReq as NextApiRequest, mockRes as NextApiResponse, mockUser);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id FROM Playlists WHERE id = ? AND user_id = ?');
      expect(db.prepare('').get).toHaveBeenCalledWith('1', mockUser.id);
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT s.id, s.title, s.artist, s.album, s.duration, ps.song_order'));
      expect(db.prepare('').all).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('POST /api/playlists/songs', () => {
    it('should add a song to a playlist', async () => {
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 1 });
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ maxOrder: 2 });
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ lastInsertRowid: 3 });

      mockReq.method = 'POST';
      mockReq.body = { playlist_id: 1, song_id: 2 };
      await addSongToPlaylist(mockReq as NextApiRequest, mockRes as NextApiResponse, mockUser);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id FROM Playlists WHERE id = ? AND user_id = ?');
      expect(db.prepare('').get).toHaveBeenCalledWith(1, mockUser.id);
      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO PlaylistSongs (playlist_id, song_id, song_order) VALUES (?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(1, 2, 3);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 3,
        playlist_id: 1,
        song_id: 2,
        song_order: 3,
      }));
    });
  });

  describe('DELETE /api/playlists/songs', () => {
    it('should remove a song from a playlist', async () => {
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 1 });
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'DELETE';
      mockReq.query = { playlist_id: '1', song_id: '2' };
      await removeSongFromPlaylist(mockReq as NextApiRequest, mockRes as NextApiResponse, mockUser);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id FROM Playlists WHERE id = ? AND user_id = ?');
      expect(db.prepare('').get).toHaveBeenCalledWith('1', mockUser.id);
      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM PlaylistSongs WHERE playlist_id = ? AND song_id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1', '2');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song removed from playlist successfully' });
    });
  });

  describe('PUT /api/playlists/songs', () => {
    it('should update the order of a song in a playlist', async () => {
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 1 });
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'PUT';
      mockReq.body = { playlist_id: 1, song_id: 2, new_order: 3 };
      await updatePlaylistSongOrder(mockReq as NextApiRequest, mockRes as NextApiResponse, mockUser);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id FROM Playlists WHERE id = ? AND user_id = ?');
      expect(db.prepare('').get).toHaveBeenCalledWith(1, mockUser.id);
      expect(db.prepare).toHaveBeenCalledWith('UPDATE PlaylistSongs SET song_order = ? WHERE playlist_id = ? AND song_id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith(3, 1, 2);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Playlist song order updated successfully' });
    });
  });
});