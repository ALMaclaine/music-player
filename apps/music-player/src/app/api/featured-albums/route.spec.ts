/**
 * @jest-environment node
 */
import { GET } from './route';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

jest.mock('../../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  all: jest.fn(),
}));

jest.mock('../../../lib/errorHandler', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('Featured Albums API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return featured albums', async () => {
    const mockAlbums = [
      { id: 1, title: 'Album 1', artist: 'Artist 1', cover_image: '/cover1.jpg' },
      { id: 2, title: 'Album 2', artist: 'Artist 2', cover_image: '/cover2.jpg' },
      { id: 3, title: 'Album 3', artist: 'Artist 3', cover_image: '/cover3.jpg' },
      { id: 4, title: 'Album 4', artist: 'Artist 4', cover_image: '/cover4.jpg' },
    ];

    (db.prepare('').all as jest.Mock).mockReturnValue(mockAlbums);

    const response = await GET();
    const responseData = await response.json();

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT a.id, a.title, ar.name as artist, a.cover_image'));
    expect(response.status).toBe(200);
    expect(responseData).toEqual(mockAlbums);
    expect(logInfo).toHaveBeenCalledWith('Retrieved featured albums', { count: 4 });
  });

  it('should handle errors and return 500 status', async () => {
    const mockError = new Error('Database error');
    (db.prepare('').all as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Internal Server Error' });
    expect(logError).toHaveBeenCalledWith('Error fetching featured albums', { error: 'Database error' });
  });
});