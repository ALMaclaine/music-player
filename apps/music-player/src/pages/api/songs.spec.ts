import { NextApiRequest, NextApiResponse } from 'next';
import handler from './songs';
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

describe('Songs API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

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
    jest.clearAllMocks();
  });

  describe('GET /api/songs', () => {
    it('should get all songs', async () => {
      const mockSongs = [
        { id: 1, title: 'Song 1', artist: 'Artist 1', album: 'Album 1', duration: 180 },
        { id: 2, title: 'Song 2', artist: 'Artist 2', album: 'Album 2', duration: 240 },
      ];
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockSongs);

      mockReq.method = 'GET';
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id, title, artist, album, duration FROM Songs');
      expect(db.prepare('').all).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('POST /api/songs', () => {
    it('should create a new song', async () => {
      const newSong = { title: 'New Song', artist: 'New Artist', album: 'New Album', duration: 200, file_path: '/path/to/song.mp3' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ lastInsertRowid: 3 });

      mockReq.method = 'POST';
      mockReq.body = newSong;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(newSong.title, newSong.artist, newSong.album, newSong.duration, newSong.file_path);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 3,
        title: newSong.title,
        artist: newSong.artist,
        album: newSong.album,
        duration: newSong.duration,
      });
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.method = 'POST';
      mockReq.body = { title: 'Incomplete Song' }; // Missing other required fields
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });
  });

  describe('PUT /api/songs', () => {
    it('should update an existing song', async () => {
      const updatedSong = { title: 'Updated Song', artist: 'Updated Artist', album: 'Updated Album', duration: 210 };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = updatedSong;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Songs SET'));
      expect(db.prepare('').run).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song updated successfully' });
    });

    it('should return 404 when updating non-existent song', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '999' };
      mockReq.body = { title: 'Nonexistent Song' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Song not found' });
    });
  });

  describe('DELETE /api/songs', () => {
    it('should delete a song', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Songs WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song deleted successfully' });
    });

    it('should return 404 when deleting non-existent song', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '999' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Song not found' });
    });
  });

  it('should return 405 for invalid request method', async () => {
    mockReq.method = 'PATCH';
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.METHOD_NOT_ALLOWED);
    expect(mockRes.end).toHaveBeenCalledWith('Method PATCH Not Allowed');
  });
});