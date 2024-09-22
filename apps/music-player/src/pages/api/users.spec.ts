import { NextApiRequest, NextApiResponse } from 'next';
import handler from './users';
import db from '../../lib/db/db';
import { User } from '../../lib/auth';

jest.mock('../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  all: jest.fn(),
  run: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../../lib/auth', () => ({
  withAuth: (handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) => 
    (req: NextApiRequest, res: NextApiResponse) => 
      handler(req, res, { id: 1, username: 'testuser', email: 'test@example.com' }),
  authenticateUser: jest.fn(),
  generateToken: jest.fn(),
}));

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

describe('Users API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
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
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockUsers);

      mockReq.method = 'GET';
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id, username, email FROM Users');
      expect(db.prepare('').all).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = { username: 'newuser', email: 'newuser@example.com', password: 'password123' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ lastInsertRowid: 3 });

      mockReq.method = 'POST';
      mockReq.body = newUser;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(newUser.username, newUser.email, newUser.password);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 3,
        username: newUser.username,
        email: newUser.email,
      });
    });
  });

  describe('PUT /api/users', () => {
    it('should update an existing user', async () => {
      const updatedUser = { username: 'updateduser', email: 'updated@example.com' };
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 1 });
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = updatedUser;
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id FROM Users WHERE id = ?');
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Users SET'));
      expect(db.prepare('').run).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
    });

    it('should return 404 when updating non-existent user', async () => {
      (db.prepare('').get as jest.Mock).mockReturnValueOnce(null);

      mockReq.method = 'PUT';
      mockReq.query = { id: '1' };
      mockReq.body = { username: 'nonexistent' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 403 when updating a different user', async () => {
      mockReq.method = 'PUT';
      mockReq.query = { id: '2' };
      mockReq.body = { username: 'differentuser' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authorized to update this user' });
    });
  });

  describe('DELETE /api/users', () => {
    it('should delete a user', async () => {
      (db.prepare('').get as jest.Mock).mockReturnValueOnce({ id: 1 });
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(db.prepare).toHaveBeenCalledWith('SELECT id FROM Users WHERE id = ?');
      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Users WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 404 when deleting non-existent user', async () => {
      (db.prepare('').get as jest.Mock).mockReturnValueOnce(null);

      mockReq.method = 'DELETE';
      mockReq.query = { id: '1' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 403 when deleting a different user', async () => {
      mockReq.method = 'DELETE';
      mockReq.query = { id: '2' };
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this user' });
    });
  });

  it('should return 405 for invalid request method', async () => {
    mockReq.method = 'PATCH';
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.METHOD_NOT_ALLOWED);
    expect(mockRes.end).toHaveBeenCalledWith('Method PATCH Not Allowed');
  });
});