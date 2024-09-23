/**
 * @jest-environment node
 */
import * as userHandlers from './route';
import db from '../../../lib/db/db';
import { authenticateUser, generateToken } from '../../../lib/auth';

jest.mock('../../../lib/db/db', () => ({
  prepare: jest.fn().mockReturnThis(),
  all: jest.fn(),
  run: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../../../lib/auth', () => ({
  authenticateUser: jest.fn(),
  generateToken: jest.fn(),
}));

jest.mock('../../../lib/errorHandler', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' },
      ];
      (db.prepare('').all as jest.Mock).mockReturnValueOnce(mockUsers);

      const response = await userHandlers.GET();
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('SELECT id, username, email FROM Users');
      expect(db.prepare('').all).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockUsers);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = { username: 'newuser', email: 'newuser@example.com', password: 'password123' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ lastInsertRowid: 3 });

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const response = await userHandlers.POST(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)');
      expect(db.prepare('').run).toHaveBeenCalledWith(newUser.username, newUser.email, newUser.password);
      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        id: 3,
        username: newUser.username,
        email: newUser.email,
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteUser = { username: 'incomplete' };

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteUser),
      });

      const response = await userHandlers.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should handle login', async () => {
      const loginData = { action: 'login', email: 'user@example.com', password: 'password123' };
      const mockUser = { id: 1, username: 'user', email: 'user@example.com' };
      const mockToken = 'mock-token';

      (authenticateUser as jest.Mock).mockReturnValueOnce(mockUser);
      (generateToken as jest.Mock).mockReturnValueOnce(mockToken);

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const response = await userHandlers.POST(request);
      const responseData = await response.json();

      expect(authenticateUser).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        token: mockToken,
        user: mockUser,
      });
    });

    it('should return 401 for invalid login', async () => {
      const loginData = { action: 'login', email: 'user@example.com', password: 'wrongpassword' };

      (authenticateUser as jest.Mock).mockReturnValueOnce(null);

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const response = await userHandlers.POST(request);
      const responseData = await response.json();

      expect(authenticateUser).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Invalid email or password' });
    });
  });

  describe('PUT /api/users', () => {
    it('should update an existing user', async () => {
      const updatedUser = { id: 1, username: 'updateduser', email: 'updated@example.com' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      const request = new Request('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      const response = await userHandlers.PUT(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE Users SET'));
      expect(db.prepare('').run).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: 'User updated successfully' });
    });

    it('should return 404 when updating a non-existent user', async () => {
      const nonExistentUser = { id: 999, username: 'nonexistent' };
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      const request = new Request('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nonExistentUser),
      });

      const response = await userHandlers.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'User not found' });
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteUser = { id: 1 };

      const request = new Request('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteUser),
      });

      const response = await userHandlers.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });
  });

  describe('DELETE /api/users', () => {
    it('should delete a user', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 1 });

      const request = new Request('http://localhost:3000/api/users?id=1', {
        method: 'DELETE',
      });

      const response = await userHandlers.DELETE(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Users WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('1');
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: 'User deleted successfully' });
    });

    it('should return 404 when deleting a non-existent user', async () => {
      (db.prepare('').run as jest.Mock).mockReturnValueOnce({ changes: 0 });

      const request = new Request('http://localhost:3000/api/users?id=999', {
        method: 'DELETE',
      });

      const response = await userHandlers.DELETE(request);
      const responseData = await response.json();

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM Users WHERE id = ?');
      expect(db.prepare('').run).toHaveBeenCalledWith('999');
      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'User not found' });
    });

    it('should return 400 when user id is missing', async () => {
      const request = new Request('http://localhost:3000/api/users', {
        method: 'DELETE',
      });

      const response = await userHandlers.DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing user id' });
    });
  });
});