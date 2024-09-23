import { NextApiRequest, NextApiResponse } from 'next';
import handler from './search';
import db from '../../lib/db/db';

const HttpStatus = {
  OK: 200,
  BAD_REQUEST: 400,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

jest.mock('../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnValue({
    all: jest.fn(),
  }),
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
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.METHOD_NOT_ALLOWED);
    expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Method not allowed' });
  });

  it('should return 400 if search query is missing', async () => {
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'Search query is required' });
  });

  it('should return search results for songs and playlists', async () => {
    mockReq.query = { q: 'test' };
    const mockSongs = [{ id: 1, title: 'Test Song' }];
    const mockPlaylists = [{ id: 1, name: 'Test Playlist' }];

    const mockPrepare = jest.fn().mockReturnValue({
      all: jest.fn()
        .mockReturnValueOnce(mockSongs)
        .mockReturnValueOnce(mockPlaylists),
    });
    (db.prepare as jest.Mock).mockImplementation(mockPrepare);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(db.prepare).toHaveBeenCalledTimes(2);
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({ songs: mockSongs, playlists: mockPlaylists });
  });

  it('should handle database errors', async () => {
    mockReq.query = { q: 'test' };
    (db.prepare as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith({ status: 'error', message: 'An unexpected error occurred' });
  });
});