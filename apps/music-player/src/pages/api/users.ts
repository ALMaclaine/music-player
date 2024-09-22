import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUsers(req, res);
    case 'POST':
      return createUser(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = db.prepare('SELECT id, username, email FROM Users').all();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
}

function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = db.prepare('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password);
    res.status(201).json({ id: result.lastInsertRowid, username, email });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
}