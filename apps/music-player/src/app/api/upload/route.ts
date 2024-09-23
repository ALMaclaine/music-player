import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import db from '../../../lib/db/db';
import { logInfo, logError } from '../../../lib/errorHandler';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/\s+/g, '-').toLowerCase();
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Insert the file information into the Songs table
    const stmt = db.prepare('INSERT INTO Songs (title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(filename, 'Unknown Artist', 'Unknown Album', 0, filepath);

    if (result.changes !== 1) {
      throw new Error('Failed to insert song into database');
    }

    logInfo('File uploaded successfully', { filename, filepath });
    return NextResponse.json({ message: 'File uploaded successfully', filename });
  } catch (error) {
    logError('Error uploading file', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}