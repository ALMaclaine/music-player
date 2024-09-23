import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public/uploads');
  form.keepExtensions = true;

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error uploading file' });
    }

    const file = files.file as File;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const oldPath = file.filepath;
    const newPath = path.join(form.uploadDir, file.originalFilename || file.newFilename);

    try {
      await fs.promises.rename(oldPath, newPath);
      res.status(200).json({ 
        message: 'File uploaded successfully',
        filePath: `/uploads/${path.basename(newPath)}` 
      });
    } catch (error) {
      console.error('Error moving file:', error);
      res.status(500).json({ error: 'Error saving file' });
    }
  });
}