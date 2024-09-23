/**
 * @jest-environment node
 */
import * as songHandlers from './route';
import db from '../../../lib/db/db';
import { logError } from '../../../lib/errorHandler';

jest.mock('../../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  all: jest.fn(),
  run: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../../../lib/errorHandler', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('Songs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/songs', () => {
    it('should get songs with pagination', async () => {
      const mockSongs = [
        { id: 1, title: 'Song 1', artist: 'Artist 1' },
        { id: 2, title: 'Song 2', artist: 'Artist 2' },
      ];
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockSongs);
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ count: 10 });

      const request = new Request('http://localhost:3000/api/songs?limit=2&offset=0');
      const response = await songHandlers.GET(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM Songs LIMIT ? OFFSET ?');
      expect(db.prepare('').all).toHaveBeenCalledWith(2, 0);
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        songs: mockSongs,
        total: 10,
        limit: 2,
        offset: 0
      });
    });
  });

  describe('POST /api/songs', () => {
    it('should create a new song', async () => {
      const newSong = { title: 'New Song', artist: 'New Artist', album: 'New Album', duration: 180, file_path: '/path/to/song.mp3' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ lastInsertRowid: 3, changes: 1 });
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 3, ...newSong });

      const request = new Request('http://localhost:3000/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSong),
      });

      const response = await songHandlers.POST(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(newSong.title, newSong.artist, newSong.album, newSong.duration, newSong.file_path);
      expect(response.status).toBe(201);
      expect(responseData).toEqual({ id: 3, ...newSong });
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteSong = { title: 'Incomplete Song' };

      const request = new Request('http://localhost:3000/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteSong),
      });

      const response = await songHandlers.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should return 409 when creating a song with existing file path', async () => {
      const newSong = { title: 'New Song', artist: 'New Artist', album: 'New Album', duration: 180, file_path: '/path/to/existing-song.mp3' };
      const uniqueError = new Error('UNIQUE constraint failed');
      (db.prepare('').run as jest.Mock).mockImplementationOnce(() => {
        throw uniqueError;
      });

      const request = new Request('http://localhost:3000/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSong),
      });

      const response = await songHandlers.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData).toEqual({ error: 'Song with this file path already exists' });
      expect(logError).toHaveBeenCalledWith('Error creating song', { error: 'UNIQUE constraint failed' });
    });
  });

  describe('PUT /api/songs', () => {
    it('should update an existing song', async () => {
      const updatedSong = { id: 1, title: 'Updated Song', artist: 'Updated Artist' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      const request = new Request('http://localhost:3000/api/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSong),
      });

      const response = await songHandlers.PUT(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Songs SET'));
      expect(db.prepare('').run).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: 'Song updated successfully' });
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteSong = { id: 1 };

      const request = new Request('http://localhost:3000/api/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteSong),
      });

      const response = await songHandlers.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should return 404 when updating a non-existent song', async () => {
      const nonExistentSong = { id: 999, title: 'Non-existent Song' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      const request = new Request('http://localhost:3000/api/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nonExistentSong),
      });

      const response = await songHandlers.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Song not found' });
    });
  });

  describe('DELETE /api/songs', () => {
    it('should delete a song', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      const request = new Request('http://localhost:3000/api/songs?id=1', {
        method: 'DELETE',
      });

      const response = await songHandlers.DELETE(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Songs WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1');
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: 'Song deleted successfully' });
    });

    it('should return 400 when song id is missing', async () => {
      const request = new Request('http://localhost:3000/api/songs', {
        method: 'DELETE',
      });

      const response = await songHandlers.DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing song id' });
    });

    it('should return 404 when deleting a non-existent song', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      const request = new Request('http://localhost:3000/api/songs?id=999', {
        method: 'DELETE',
      });

      const response = await songHandlers.DELETE(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Songs WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('999');
      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Song not found' });
    });
  });
});
