import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  // For this example, we'll assume the audio files are stored in a 'public/audio' directory
  // In a real application, you'd fetch the file path from your database based on the id
  const filePath = path.join(process.cwd(), 'public', 'audio', `${id}.mp3`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize.toString(),
      'Content-Type': 'audio/mpeg',
    };
    return new NextResponse(file as unknown as ReadableStream, { status: 206, headers: head });
  } else {
    const head = {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'audio/mpeg',
    };
    const file = fs.createReadStream(filePath);
    return new NextResponse(file as unknown as ReadableStream, { headers: head });
  }
}