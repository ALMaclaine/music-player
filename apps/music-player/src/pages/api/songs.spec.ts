import { NextApiRequest, NextApiResponse } from 'next';
import handler from './songs';
import db from '../../lib/db/db';

jest.mock('../../lib/db/db');

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
  let prepareMock: jest.Mock;
  let runMock: jest.Mock;
  let allMock: jest.Mock;
  let getMock: jest.Mock;

  beforeEach(() => {
    runMock = jest.fn();
    allMock = jest.fn();
    getMock = jest.fn();
    prepareMock = db.prepare as jest.Mock;
    prepareMock.mockReturnValue({
      run: runMock,
      all: allMock,
      get: getMock,
    });

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
      allMock.mockReturnValueOnce(mockSongs);

      mockReq.method = 'GET';
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith('SELECT id, title, artist, album, duration FROM Songs');
      expect(allMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('POST /api/songs', () => {
    it('should create a new song', async () => {
      const newSong = { title: 'New Song', artist: 'New Artist', album: 'New Album', duration: 200, file_path: '/path/to/song.mp3' };
      runMock.mockReturnValueOnce({ lastInsertRowid: 3 });

      mockReq.method = 'POST';
      mockReq.body = newSong;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
      expect(runMock).toHaveBeenCalledWith(newSong.title, newSong.artist, newSong.album, newSong.duration, newSong.file_path);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          title: newSong.title,
          artist: newSong.artist,
          album: newSong.album,
          duration: newSong.duration,
        })
      );
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
      runMock.mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = updatedSong;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith(expect.stringContaining('UPDATE Songs SET'));
      expect(runMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song updated successfully' });
    });

    it('should return 404 when updating non-existent song', async () => {
      runMock.mockReturnValueOnce({ changes: 0 });

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
      runMock.mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith('DELETE FROM Songs WHERE id = ?');
      expect(runMock).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song deleted successfully' });
    });

    it('should return 404 when deleting non-existent song', async () => {
      runMock.mockReturnValueOnce({ changes: 0 });

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

  // TODO: Add tests for authentication and authorization if applicable
});