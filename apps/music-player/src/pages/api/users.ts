import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { authenticateUser, generateToken, withAuth, User } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getUsers)(req, res);
    case 'POST':
      if (req.body.action === 'login') {
        return login(req, res);
      }
      return createUser(req, res);
    case 'PUT':
      return withAuth(updateUser)(req, res);
    case 'DELETE':
      return withAuth(deleteUser)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse, currentUser: User) {
  try {
    const users = db.prepare('SELECT id, username, email FROM Users').all();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
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

async function updateUser(req: NextApiRequest, res: NextApiResponse, currentUser: User) {
  const { id } = req.query;
  const { username, email, password } = req.body;
  if (!id || (!username && !email && !password)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (currentUser.id !== Number(id)) {
    return res.status(403).json({ error: 'Not authorized to update this user' });
  }

  try {
    const userExists = db.prepare('SELECT id FROM Users WHERE id = ?').get(id);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
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
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse, currentUser: User) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing user id' });
  }

  if (currentUser.id !== Number(id)) {
    return res.status(403).json({ error: 'Not authorized to delete this user' });
  }

  try {
    const userExists = db.prepare('SELECT id FROM Users WHERE id = ?').get(id);
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = db.prepare('DELETE FROM Users WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
}

async function login(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const user = authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
}