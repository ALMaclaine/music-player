/**
 * @jest-environment node
 */
import * as playlistHandlers from './route';
import db from '../../../lib/db/db';

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

describe('Playlists API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/playlists', () => {
    it('should get playlists for a user', async () => {
      const mockPlaylists = [
        { id: 1, name: 'Playlist 1', user_id: 1 },
        { id: 2, name: 'Playlist 2', user_id: 1 },
      ];
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockPlaylists);

      const request = new Request('http://localhost:3000/api/playlists?userId=1');
      const response = await playlistHandlers.GET(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM Playlists WHERE user_id = ?');
      expect(db.prepare('').all).toHaveBeenCalledWith('1');
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPlaylists);
    });

    it('should return 400 if userId is missing', async () => {
      const request = new Request('http://localhost:3000/api/playlists');
      const response = await playlistHandlers.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'User ID is required' });
    });
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      const newPlaylist = { userId: 1, name: 'New Playlist' };
      const mockInsertResult = { lastInsertRowid: 3, changes: 1 };
      const mockNewPlaylist = { id: 3, user_id: 1, name: 'New Playlist' };
      
      (db.prepare('').run as jest.Mock).mockReturnValueOnce(mockInsertResult);
      (db.prepare('').get as jest.Mock).mockReturnValueOnce(mockNewPlaylist);

      const request = new Request('http://localhost:3000/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlaylist),
      });

      const response = await playlistHandlers.POST(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Playlists (user_id, name) VALUES (?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(newPlaylist.userId, newPlaylist.name);
      expect(response.status).toBe(201);
      expect(responseData).toEqual(mockNewPlaylist);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompletePlaylist = { userId: 1 };
      
      const request = new Request('http://localhost:3000/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompletePlaylist),
      });

      const response = await playlistHandlers.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });
  });

  describe('PUT /api/playlists', () => {
    it('should update an existing playlist', async () => {
      const updatedPlaylist = { id: 1, name: 'Updated Playlist' };
      const mockUpdateResult = { changes: 1 };
      const mockUpdatedPlaylist = { id: 1, name: 'Updated Playlist', user_id: 1 };
      
      (db.prepare('').run as jest.Mock).mockReturnValueOnce(mockUpdateResult);
      (db.prepare('').get as jest.Mock).mockReturnValueOnce(mockUpdatedPlaylist);

      const request = new Request('http://localhost:3000/api/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlaylist),
      });

      const response = await playlistHandlers.PUT(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('UPDATE Playlists SET name = ? WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith(updatedPlaylist.name, updatedPlaylist.id);
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockUpdatedPlaylist);
    });

    it('should return 404 if playlist is not found', async () => {
      const nonExistentPlaylist = { id: 999, name: 'Non-existent Playlist' };
      const mockUpdateResult = { changes: 0 };
      
      (db.prepare('').run as jest.Mock).mockReturnValueOnce(mockUpdateResult);

      const request = new Request('http://localhost:3000/api/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nonExistentPlaylist),
      });

      const response = await playlistHandlers.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Playlist not found' });
    });

    it('should return 400 if required fields are missing', async () => {
      const incompletePlaylist = { id: 1 };
      
      const request = new Request('http://localhost:3000/api/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompletePlaylist),
      });

      const response = await playlistHandlers.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });
  });

  describe('DELETE /api/playlists', () => {
    it('should delete a playlist', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      const request = new Request('http://localhost:3000/api/playlists?id=1', {
        method: 'DELETE',
      });

      const response = await playlistHandlers.DELETE(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Playlists WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1');
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: 'Playlist deleted successfully' });
    });

    it('should return 404 if playlist is not found', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      const request = new Request('http://localhost:3000/api/playlists?id=999', {
        method: 'DELETE',
      });

      const response = await playlistHandlers.DELETE(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Playlists WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('999');
      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Playlist not found' });
    });

    it('should return 400 if playlist ID is missing', async () => {
      const request = new Request('http://localhost:3000/api/playlists', {
        method: 'DELETE',
      });

      const response = await playlistHandlers.DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Playlist ID is required' });
    });
  });
});
