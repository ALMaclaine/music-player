import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db/db';
import { withAuth } from '../../lib/auth';
import { asyncHandler, AppError, logInfo, logError } from '../../lib/errorHandler';
import fs from 'fs';
import path from 'path';
import busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return getSongs(req, res);
    case 'POST':
      return createSong(req, res);
    case 'PUT':
      return updateSong(req, res);
    case 'DELETE':
      return deleteSong(req, res);
    default:
      throw new AppError('Method not allowed', 405);
  }
});

const getSongs = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const songs = db.prepare('SELECT id, title, artist, album, duration, file_path FROM Songs').all();
  logInfo('Retrieved all songs', { count: songs.length });
  res.status(200).json(songs);
});

const createSong = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const bb = busboy({ headers: req.headers });
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  let uploadedFile: string | null = null;
  let title: string | null = null;
  let artist: string | null = null;
  let album: string | null = null;
  let duration: string | null = null;

  bb.on('file', (name: string, file: NodeJS.ReadableStream, info: busboy.FileInfo) => {
    const filename = info.filename;
    const filePath = path.join(uploadDir, filename);
    const writeStream = fs.createWriteStream(filePath);

    file.pipe(writeStream);

    file.on('end', () => {
      uploadedFile = filePath;
      logInfo('File uploaded', { filename, filePath });
    });
  });

  bb.on('field', (name: string, val: string) => {
    switch (name) {
      case 'title':
        title = val;
        break;
      case 'artist':
        artist = val;
        break;
      case 'album':
        album = val;
        break;
      case 'duration':
        duration = val;
        break;
    }
  });

  await new Promise((resolve, reject) => {
    bb.on('close', resolve);
    bb.on('error', (err) => {
      logError('Error during file upload', { error: err });
      reject(err);
    });
    req.pipe(bb);
  });

  if (!uploadedFile || !title || !artist || !duration) {
    logError('Missing required fields for song creation', { uploadedFile, title, artist, duration });
    throw new AppError('Missing required fields', 400);
  }

  const result = db.prepare('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)').run(
    title,
    artist,
    album,
    duration,
    `/uploads/${path.basename(uploadedFile)}`
  );

  logInfo('Song created', { id: result.lastInsertRowid, title, artist });
  res.status(201).json({
    id: result.lastInsertRowid,
    title,
    artist,
    album,
    duration,
    file_path: `/uploads/${path.basename(uploadedFile)}`,
  });
});

const updateSong = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { title, artist, album, duration } = req.body;

  if (!id || typeof id !== 'string') {
    logError('Invalid song ID for update', { id });
    throw new AppError('Invalid song ID', 400);
  }

  const result = db.prepare('UPDATE Songs SET title = ?, artist = ?, album = ?, duration = ? WHERE id = ?').run(
    title,
    artist,
    album,
    duration,
    id
  );

  if (result.changes === 0) {
    logError('Attempt to update non-existent song', { id });
    throw new AppError('Song not found', 404);
  }

  logInfo('Song updated', { id, title, artist });
  res.status(200).json({ message: 'Song updated successfully' });
});

const deleteSong = asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    logError('Invalid song ID for deletion', { id });
    throw new AppError('Invalid song ID', 400);
  }

  const result = db.prepare('DELETE FROM Songs WHERE id = ?').run(id);

  if (result.changes === 0) {
    logError('Attempt to delete non-existent song', { id });
    throw new AppError('Song not found', 404);
  }

  logInfo('Song deleted', { id });
  res.status(200).json({ message: 'Song deleted successfully' });
});

export default withAuth(handler);