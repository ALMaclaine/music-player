import { NextResponse } from 'next/server';
import db from '../../../lib/db/db';
import { authenticateUser, generateToken } from '../../../lib/auth';
import { logInfo, logError } from '../../../lib/errorHandler';

export async function GET() {
  try {
    const users = db.prepare('SELECT id, username, email FROM Users').all();
    logInfo('Retrieved all users', { count: users.length });
    return NextResponse.json(users);
  } catch (error) {
    logError('Error fetching users', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, email, password } = body;

    if (action === 'login') {
      return handleLogin(email, password);
    }

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = db.prepare('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password);
    logInfo('User created', { id: result.lastInsertRowid, username, email });
    return NextResponse.json({ id: result.lastInsertRowid, username, email }, { status: 201 });
  } catch (error) {
    logError('Error creating user', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, username, email, password } = body;

    if (!id || (!username && !email && !password)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    logInfo('User updated', { id });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    logError('Error updating user', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const result = db.prepare('DELETE FROM Users WHERE id = ?').run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    logInfo('User deleted', { id });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    logError('Error deleting user', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleLogin(email: string, password: string) {
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const user = authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = generateToken(user);
  logInfo('User logged in', { id: user.id, username: user.username });
  return NextResponse.json({ token, user: { id: user.id, username: user.username, email: user.email } });
}