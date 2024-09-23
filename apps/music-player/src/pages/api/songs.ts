import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { withAuth, User } from '../../lib/auth';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getSongs)(req, res);
    case 'POST':
      return withAuth(createSong)(req, res);
    case 'PUT':
      return withAuth(updateSong)(req, res);
    case 'DELETE':
      return withAuth(deleteSong)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getSongs(req: NextApiRequest, res: NextApiResponse, user: User) {
  try {
    const songs = db.prepare('SELECT id, title, artist, album, duration, file_path FROM Songs').all();
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Error fetching songs' });
  }
}

async function createSong(req: NextApiRequest, res: NextApiResponse, user: User) {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public/uploads');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error uploading file' });
    }

    const { title, artist, album, duration } = fields;
    const file = files.file as File;

    if (!title || !artist || !duration || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const oldPath = file.filepath;
    const newPath = path.join(form.uploadDir, file.originalFilename || file.newFilename);

    try {
      await fs.promises.rename(oldPath, newPath);
      const file_path = `/uploads/${path.basename(newPath)}`;

      const result = db.prepare('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)').run(title, artist, album, duration, file_path);
      res.status(201).json({ 
        id: result.lastInsertRowid, 
        title, 
        artist, 
        album, 
        duration,
        file_path 
      });
    } catch (error) {
      console.error('Error creating song:', error);
      res.status(500).json({ error: 'Error creating song' });
    }
  });
}

async function updateSong(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { id } = req.query;
  const { title, artist, album, duration, file_path } = req.body;
  if (!id || (!title && !artist && !album && !duration && !file_path)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let query = 'UPDATE Songs SET ';
    const params = [];
    if (title) {
      query += 'title = ?, ';
      params.push(title);
    }
    if (artist) {
      query += 'artist = ?, ';
      params.push(artist);
    }
    if (album) {
      query += 'album = ?, ';
      params.push(album);
    }
    if (duration) {
      query += 'duration = ?, ';
      params.push(duration);
    }
    if (file_path) {
      query += 'file_path = ?, ';
      params.push(file_path);
    }
    query = query.slice(0, -2); // Remove last comma and space
    query += ' WHERE id = ?';
    params.push(id);

    const result = db.prepare(query).run(...params);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.status(200).json({ message: 'Song updated successfully' });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Error updating song' });
  }
}

async function deleteSong(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing song id' });
  }

  try {
    const result = db.prepare('DELETE FROM Songs WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Error deleting song' });
  }
}