import { NextApiRequest, NextApiResponse } from 'next';
import handler from './songs';
import db from '../../lib/db/db';
import busboy from 'busboy';

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
}));

jest.mock('fs', () => ({
  createWriteStream: jest.fn(() => {
    const { PassThrough} = jest.requireActual('stream');
    const pass = new PassThrough();
    // Spy on methods if needed
    pass.on = jest.fn(pass.on.bind(pass));
    pass.once = jest.fn(pass.once.bind(pass));
    pass.emit = pass.emit.bind(pass);
    pass.end = jest.fn(pass.end.bind(pass));
    return pass;
  }),
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mocked/path'),
  basename: jest.fn().mockReturnValue('mocked-filename'),
}));

jest.mock('../../lib/auth', () => ({
  withAuth: jest.fn((handler) => handler),
}));

interface MockBusboyEvents {
  file: (fieldname: string, file: PassThrough, info: busboy.FileInfo) => void;
  field: (name: string, val: string, info: busboy.FieldInfo) => void;
  finish: () => void;
  close: () => void; // Add 'close' event
}

const createMockBusboy = () => {
  const callbacks: Partial<{ [K in keyof MockBusboyEvents]: MockBusboyEvents[K][] }> = {};
  const busboyInstance = {
    on: <K extends keyof MockBusboyEvents>(event: K, callback: MockBusboyEvents[K]) => {
      if (!callbacks[event]) {
        callbacks[event] = [];
      }
      callbacks[event]?.push(callback);
      return busboyInstance;
    },
    emit: <K extends keyof MockBusboyEvents>(event: K, ...args: Parameters<MockBusboyEvents[K]>) => {
      callbacks[event]?.forEach(cb => {
        (cb as (...args: Parameters<MockBusboyEvents[K]>) => void)(...args);
      });
    },
  };
  return busboyInstance;
};

jest.mock('busboy', () => {
  return jest.fn().mockImplementation(() => createMockBusboy());
});

describe('Songs API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      query: {},
      body: {},
      pipe: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('GET /api/songs', () => {
    it('should return all songs', async () => {
      const mockSongs = [{ id: 1, title: 'Test Song' }];
      (db.prepare('').all as jest.Mock).mockReturnValue(mockSongs);

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id, title, artist, album, duration, file_path FROM Songs');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockSongs);
    });
  });

  describe('POST /api/songs', () => {
    it('should create a new song', async () => {
      jest.setTimeout(10000); // Increase timeout to 10 seconds

      mockReq.method = 'POST';
      mockReq.headers = { 'content-type': 'multipart/form-data; boundary=---boundary' };

      (db.prepare('').run as jest.Mock).mockReturnValue({ lastInsertRowid: 1 });

      const mockBusboy = createMockBusboy();
      jest.mocked(busboy).mockReturnValue(mockBusboy as unknown as busboy.Busboy);

      const { PassThrough } = jest.requireActual('stream');
      // Create a PassThrough stream for the file
      const mockFileStream = new PassThrough();

      // Emit the 'file' event with the mock file stream
      process.nextTick(() => {
        mockBusboy.emit('file', 'file', mockFileStream, { filename: 'test.mp3', encoding: '7bit', mimeType: 'audio/mpeg' });
        mockBusboy.emit('field', 'title', 'Test Song', { nameTruncated: false, valueTruncated: false, encoding: '7bit', mimeType: 'text/plain' });
        mockBusboy.emit('field', 'artist', 'Test Artist', { nameTruncated: false, valueTruncated: false, encoding: '7bit', mimeType: 'text/plain' });
        mockBusboy.emit('field', 'album', 'Test Album', { nameTruncated: false, valueTruncated: false, encoding: '7bit', mimeType: 'text/plain' });
        mockBusboy.emit('field', 'duration', '3:30', { nameTruncated: false, valueTruncated: false, encoding: '7bit', mimeType: 'text/plain' });
        mockBusboy.emit('finish');
        mockBusboy.emit('close'); // Emit 'close' to resolve the handler's promise
        mockFileStream.end(); // Signal the end of the file stream
      });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: '3:30',
      }));
    });

    it('should return 400 when required fields are missing', async () => {
      jest.setTimeout(10000); // Increase timeout to 10 seconds

      mockReq.method = 'POST';
      mockReq.headers = { 'content-type': 'multipart/form-data; boundary=---boundary' };

      const mockBusboy = createMockBusboy();
      jest.mocked(busboy).mockReturnValue(mockBusboy as unknown as busboy.Busboy);

      process.nextTick(() => {
        mockBusboy.emit('finish');
        mockBusboy.emit('close'); // Emit 'close' to resolve the handler's promise
      });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Missing required fields' });
    });
  });

  describe('PUT /api/songs', () => {
    it('should update a song', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = { title: 'Updated Song', artist: 'Updated Artist', album: 'Updated Album', duration: '4:00' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('UPDATE Songs SET title = ?, artist = ?, album = ?, duration = ? WHERE id = ?');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song updated successfully' });
    });

    it('should return 404 when updating non-existent song', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '999' };
      mockReq.body = { title: 'Updated Song', artist: 'Updated Artist', album: 'Updated Album', duration: '4:00' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 0 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Song not found' });
    });
  });

  describe('DELETE /api/songs', () => {
    it('should delete a song', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 1 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Songs WHERE id = ?');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Song deleted successfully' });
    });

    it('should return 404 when deleting non-existent song', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '999' };
      (db.prepare('').run as jest.Mock).mockReturnValue({ changes: 0 });

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Song not found' });
    });
  });
});
