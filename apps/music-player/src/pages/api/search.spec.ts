import { NextApiRequest, NextApiResponse } from 'next';
import handler from './search';
import db from '../../lib/db/db';

jest.mock('../../lib/db/db', () => ({
  prepare: jest.fn(),
}));

jest.mock('../../lib/auth', () => ({
  withAuth: jest.fn((handler) => handler),
}));

describe('Search API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Do nothing, we're just preventing console.error from cluttering the test output
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return 405 for non-GET requests', async () => {
    mockReq.method = 'POST';
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 400 if search query is missing', async () => {
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Search query is required' });
  });

  it('should return search results for songs and playlists', async () => {
    mockReq.query = { q: 'test' };
    const mockSongs = [{ id: 1, title: 'Test Song' }];
    const mockPlaylists = [{ id: 1, name: 'Test Playlist' }];

    const mockAll = jest.fn()
      .mockReturnValueOnce(mockSongs)
      .mockReturnValueOnce(mockPlaylists);

    (db.prepare as jest.Mock).mockReturnValue({ all: mockAll });

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(db.prepare).toHaveBeenCalledTimes(2);
    expect(mockAll).toHaveBeenCalledTimes(2);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ songs: mockSongs, playlists: mockPlaylists });
  });

  it('should handle database errors', async () => {
    mockReq.query = { q: 'test' };
    (db.prepare as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error searching:', expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error performing search' });
  });
});