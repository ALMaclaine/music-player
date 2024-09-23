// src/pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>((resolve) => { // Removed 'reject' to prevent unhandled rejections
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return resolve();
    }

    const bb = busboy({ headers: req.headers });
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    let uploadedFile: string | null = null;
    let fileError: Error | null = null;

    bb.on('file', (name: string, file: NodeJS.ReadableStream, info: busboy.FileInfo) => {
      const filename = info.filename;
      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);

      // Attach error handler before piping
      writeStream.on('error', (err) => {
        fileError = err;
      });

      file.on('end', () => {
        uploadedFile = filePath;
      });

      file.pipe(writeStream);
    });

    bb.on('finish', () => {
      if (fileError) {
        console.error('Error saving file:', fileError);
        res.status(500).json({ error: 'Error saving file' });
        return resolve();
      }

      if (!uploadedFile) {
        res.status(400).json({ error: 'No file uploaded' });
        return resolve();
      }

      res.status(200).json({
        message: 'File uploaded successfully',
        filePath: `/uploads/${path.basename(uploadedFile)}`,
      });
      return resolve();
    });

    bb.on('error', (err: Error) => { // Changed to resolve instead of reject
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error uploading file' });
      return resolve(); // Prevent unhandled promise rejection
    });

    req.pipe(bb);
  });
}
