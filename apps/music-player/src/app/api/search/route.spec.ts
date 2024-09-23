/**
 * @jest-environment node
 */
import * as searchHandlers from './route';
import db from '../../../lib/db/db';
import { logError } from '../../../lib/errorHandler';

jest.mock('../../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  all: jest.fn(),
}));

jest.mock('../../../lib/errorHandler', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return search results', async () => {
      const mockResults = [
        { id: 1, title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
        { id: 2, title: 'Song 2', artist: 'Artist 2', album: 'Album 2' },
      ];
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockResults);

      const request = new Request('http://localhost:3000/api/search?q=song');
      const response = await searchHandlers.GET(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, title, artist, album'));
      expect(db.prepare('').all).toHaveBeenCalledWith('%song%', '%song%', '%song%');
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResults);
    });

    it('should return 400 if query is missing', async () => {
      const request = new Request('http://localhost:3000/api/search');
      const response = await searchHandlers.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Search query is required' });
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database error';
      (db.prepare('').all as jest.Mock).mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const request = new Request('http://localhost:3000/api/search?q=song');
      const response = await searchHandlers.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal Server Error' });
      expect(logError).toHaveBeenCalledWith('Error searching songs', { error: errorMessage });
    });
  });
});
