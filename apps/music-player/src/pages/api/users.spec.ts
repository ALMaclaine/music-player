import { NextApiRequest, NextApiResponse } from 'next';
import handler from './users';
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

describe('Users API', () => {
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

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' },
      ];
      allMock.mockReturnValueOnce(mockUsers);

      mockReq.method = 'GET';
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith('SELECT id, username, email FROM Users');
      expect(allMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = { username: 'newuser', email: 'newuser@example.com', password: 'password123' };
      runMock.mockReturnValueOnce({ lastInsertRowid: 3 });

      mockReq.method = 'POST';
      mockReq.body = newUser;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)');
      expect(runMock).toHaveBeenCalledWith(newUser.username, newUser.email, newUser.password);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          username: newUser.username,
          email: newUser.email,
        })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.method = 'POST';
      mockReq.body = { username: 'incomplete' }; // Missing email and password
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });
  });

  describe('PUT /api/users', () => {
    it('should update an existing user', async () => {
      const updatedUser = { username: 'updateduser', email: 'updated@example.com' };
      runMock.mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = updatedUser;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith(expect.stringContaining('UPDATE Users SET'));
      expect(runMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
    });

    it('should return 404 when updating non-existent user', async () => {
      runMock.mockReturnValueOnce({ changes: 0 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '999' };
      mockReq.body = { username: 'nonexistent' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('DELETE /api/users', () => {
    it('should delete a user', async () => {
      runMock.mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(prepareMock).toHaveBeenCalledWith('DELETE FROM Users WHERE id = ?');
      expect(runMock).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 404 when deleting non-existent user', async () => {
      runMock.mockReturnValueOnce({ changes: 0 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '999' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
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