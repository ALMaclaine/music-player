import { NextApiRequest, NextApiResponse } from 'next';
import handler from './songs';
import db from '../../lib/db/db';
import busboy from 'busboy';

jest.mock('../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnValue({
    all: jest.fn(),
    run: jest.fn(),
  }),
}));

jest.mock('../../lib/auth', () => ({
  withAuth: jest.fn((handler) => handler),
}));

jest.mock('busboy', () => {
  return jest.fn().mockImplementation(() => {
    const eventHandlers: { [key: string]: (...args: unknown[]) => void } = {};
    return {
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        eventHandlers[event] = handler;
        return this;
      }),
      emit: (event: string, ...args: unknown[]) => {
        if (eventHandlers[event]) {
          eventHandlers[event](...args);
        }
      },
    };
  });
});

jest.mock('fs', () => ({
  createWriteStream: jest.fn(() => ({
    on: jest.fn((event, callback) => {
      if (event === 'finish') {
        callback();
      }
    }),
    write: jest.fn(),
    end: jest.fn(),
  })),
}));

// Mock file stream
const createMockFileStream = () => ({
  pipe: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
});

describe('Songs API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      query: {},
      headers: {},
      pipe: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('GET /api/songs', () => {
    it('should get all songs', async () => {
      const mockSongs = [{ id: 1, title: 'Test Song', artist: 'Test Artist', album: 'Test Album', duration: '3:30', file_path: '/uploads/test.mp3' }];
      (db.prepare('').all as jest.Mock).mockReturnValue(mockSongs);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id, title, artist, album, duration, file_path FROM Songs');
      expect(db.prepare('').all).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('POST /api/songs', () => {
    it('should create a new song', async () => {
      mockReq.method = 'POST';
      mockReq.headers = { 'content-type': 'multipart/form-data' };

      const mockFile = {
        filename: 'test_song.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
      };

      const mockFileStream = createMockFileStream();

      const bbInstance = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn(),
        emit: jest.fn(),
      };

      (busboy as jest.Mock).mockReturnValue(bbInstance);

      (db.prepare('').run as jest.Mock).mockReturnValue({ lastInsertRowid: 1 });

      const handlerPromise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      // Simulate the busboy events
      bbInstance.on.mock.calls.forEach(([event, handler]) => {
        if (event === 'file') {
          handler('file', mockFileStream, mockFile);
        } else if (event === 'field') {
          handler('title', 'Test Song');
          handler('artist', 'Test Artist');
          handler('album', 'Test Album');
          handler('duration', '3:30');
        } else if (event === 'finish') {
          handler();
        }
      });

      await handlerPromise;

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: '3:30',
        file_path: expect.stringContaining('/uploads/test_song.mp3'),
      }));
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.method = 'POST';
      mockReq.headers = { 'content-type': 'multipart/form-data' };

      const bbInstance = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn(),
        emit: jest.fn(),
      };

      (busboy as jest.Mock).mockReturnValue(bbInstance);

      const handlerPromise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      // Simulate the busboy events
      bbInstance.on.mock.calls.forEach(([event, handler]) => {
        if (event === 'file') {
          handler('file', createMockFileStream(), { filename: 'test.mp3' });
        } else if (event === 'field') {
          handler('title', 'Test Song');
          // Missing artist and duration
        } else if (event === 'finish') {
          handler();
        }
      });

      await handlerPromise;

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });
  });

  describe('PUT /api/songs', () => {
    it('should update a song', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = { title: 'Updated Song' };

      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Songs SET'));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song updated successfully' });
    });

    it('should return 404 when updating non-existent song', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '999' };
      mockReq.body = { title: 'Updated Song' };

      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 0 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Song not found' });
    });
  });

  describe('DELETE /api/songs', () => {
    it('should delete a song', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };

      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Songs WHERE id = ?');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song deleted successfully' });
    });

    it('should return 404 when deleting non-existent song', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '999' };

      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 0 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Song not found' });
    });
  });
});