import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { authenticateUser, generateToken, withAuth, User } from '../../lib/auth';
import { asyncHandler, AppError, logInfo } from '../../lib/errorHandler';

interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(asyncHandler(getUsers))(req, res);
    case 'POST':
      if (req.body.action === 'login') {
        return asyncHandler(login)(req, res);
      }
      return asyncHandler(createUser)(req, res);
    case 'PUT':
      return withAuth(asyncHandler(updateUser))(req, res);
    case 'DELETE':
      return withAuth(asyncHandler(deleteUser))(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      throw new AppError(`Method ${req.method} Not Allowed`, 405);
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  const users = db.prepare('SELECT id, username, email FROM Users').all();
  logInfo('Retrieved all users', { count: users.length });
  res.status(200).json(users);
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new AppError('Missing required fields', 400);
  }

  const result = db.prepare('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password);
  logInfo('User created', { id: result.lastInsertRowid, username, email });
  res.status(201).json({ id: result.lastInsertRowid, username, email });
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { username, email, password } = req.body;
  const currentUser = (req as AuthenticatedRequest).user;

  if (!id || (!username && !email && !password)) {
    throw new AppError('Missing required fields', 400);
  }

  if (currentUser.id !== Number(id)) {
    throw new AppError('Not authorized to update this user', 403);
  }

  const userExists = db.prepare('SELECT id FROM Users WHERE id = ?').get(id);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  let query = 'UPDATE Users SET ';
  const params = [];
  if (username) {
    query += 'username = ?, ';
    params.push(username);
  }
  if (email) {
    query += 'email = ?, ';
    params.push(email);
  }
  if (password) {
    query += 'password_hash = ?, ';
    params.push(password);
  }
  query = query.slice(0, -2); // Remove last comma and space
  query += ' WHERE id = ?';
  params.push(id);

  const result = db.prepare(query).run(...params);
  if (result.changes === 0) {
    throw new AppError('User not found', 404);
  }
  logInfo('User updated', { id });
  res.status(200).json({ message: 'User updated successfully' });
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const currentUser = (req as AuthenticatedRequest).user;

  if (!id) {
    throw new AppError('Missing user id', 400);
  }

  if (currentUser.id !== Number(id)) {
    throw new AppError('Not authorized to delete this user', 403);
  }

  const userExists = db.prepare('SELECT id FROM Users WHERE id = ?').get(id);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  const result = db.prepare('DELETE FROM Users WHERE id = ?').run(id);
  if (result.changes === 0) {
    throw new AppError('User not found', 404);
  }
  logInfo('User deleted', { id });
  res.status(200).json({ message: 'User deleted successfully' });
}

async function login(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Missing email or password', 400);
  }

  const user = authenticateUser(email, password);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);
  logInfo('User logged in', { id: user.id, username: user.username });
  res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
}