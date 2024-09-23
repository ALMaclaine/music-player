/**
 * @jest-environment node
 */
import * as uploadHandlers from './route';
import db from '../../../lib/db/db';
import { writeFile } from 'fs/promises';
import { logError } from '../../../lib/errorHandler';

jest.mock('../../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  run: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
}));

jest.mock('../../../lib/errorHandler', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/upload', () => {
    it('should upload a file and create a song entry', async () => {
      const mockFile = new File(['test content'], 'test-song.mp3', { type: 'audio/mpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });
      (writeFile as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await uploadHandlers.POST(request);
      const responseData = await response.json();

      expect(writeFile).toHaveBeenCalled();
      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        message: 'File uploaded successfully',
        filename: 'test-song.mp3',
      });
    });

    it('should return 400 if no file is uploaded', async () => {
      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: new FormData(),
      });

      const response = await uploadHandlers.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'No file uploaded' });
    });

    it('should handle errors during file writing', async () => {
      const mockFile = new File(['test content'], 'test-song.mp3', { type: 'audio/mpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const errorMessage = 'Error writing file';
      (writeFile as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const response = await uploadHandlers.POST(request);
      const responseData = await response.json();

      expect(writeFile).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal Server Error' });
      expect(logError).toHaveBeenCalledWith('Error uploading file', { error: errorMessage });
    });

    it('should handle errors during database insertion', async () => {
      const mockFile = new File(['test content'], 'test-song.mp3', { type: 'audio/mpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      (writeFile as jest.Mock).mockResolvedValueOnce(undefined);
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      const response = await uploadHandlers.POST(request);
      const responseData = await response.json();

      expect(writeFile).toHaveBeenCalled();
      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal Server Error' });
      expect(logError).toHaveBeenCalledWith('Error uploading file', { error: 'Failed to insert song into database' });
    });
  });

  describe('GET /api/upload', () => {
    it('should return method not allowed', async () => {
      const response = await uploadHandlers.GET();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData).toEqual({ error: 'Method not allowed' });
    });
  });

  describe('PUT /api/upload', () => {
    it('should return method not allowed', async () => {
      const response = await uploadHandlers.PUT();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData).toEqual({ error: 'Method not allowed' });
    });
  });

  describe('DELETE /api/upload', () => {
    it('should return method not allowed', async () => {
      const response = await uploadHandlers.DELETE();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData).toEqual({ error: 'Method not allowed' });
    });
  });
});