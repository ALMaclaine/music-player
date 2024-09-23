import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import db from './db/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  username: string;
  email: string;
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    return { id: decoded.id, username: decoded.username } as User;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function authenticateUser(email: string, password: string): User | null {
  const user = db.prepare('SELECT id, username, email, password_hash FROM Users WHERE email = ?').get(email) as User & { password_hash: string } | undefined;

  if (user && user.password_hash === password) { // In a real app, use bcrypt to compare hashed passwords
    return { id: user.id, username: user.username, email: user.email };
  }

  return null;
}

export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Authentication token missing' });
      return;
    }

    const user = verifyToken(token);

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    await handler(req, res, user);
  };
}