// src/pages/api/upload.spec.ts

import { NextApiRequest, NextApiResponse } from 'next';
import handler from './upload';
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import busboy from 'busboy';

// Mocking 'fs' using EventEmitter for accurate event handling
jest.mock('fs', () => {
  // Use require within the factory to access EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EventEmitter } = require('events');

  return {
    createWriteStream: jest.fn(() => {
      const emitter = new EventEmitter();
      return {
        on: emitter.on.bind(emitter),
        write: jest.fn(),
        end: jest.fn(() => {
          // Simulate the 'finish' event when end is called
          emitter.emit('finish');
        }),
        emit: emitter.emit.bind(emitter),
      };
    }),
  };
});

// Mocking 'path' module with import syntax
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  basename: jest.fn((file: string) => file.split('/').pop()),
}));

// Mocking 'busboy' using EventEmitter for accurate event handling
jest.mock('busboy', () => {
  // Use require within the factory to access EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EventEmitter } = require('events');

  // Updated to accept 'config' parameter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jest.fn().mockImplementation((config: any) => { // Accept 'config' as a parameter
    const emitter = new EventEmitter();
    return {
      on: emitter.on.bind(emitter),
      emit: emitter.emit.bind(emitter),
      pipe: jest.fn(),
    };
  });
});

describe('Upload API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      pipe: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* no-op */ });
    jest.clearAllMocks();
    // Mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue('/Users/alm/WebstormProjects/music-player/apps/music-player');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return 405 for non-POST requests', async () => {
    mockReq.method = 'GET';
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should handle file upload successfully', async () => {
    const mockFile = {
      filename: 'test_song.mp3',
      encoding: '7bit',
      mimetype: 'audio/mpeg',
    };

    // Create a mockReadStream using PassThrough for controlled event emission
    const mockReadStream = new PassThrough();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadStream.write = jest.fn().mockImplementation((chunk: any) => {
      mockReadStream.emit('data', chunk);
      return true;
    });
    mockReadStream.end = jest.fn().mockImplementation(() => {
      mockReadStream.emit('end');
    });

    // Pipe method: simulate writing data and ending the stream
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadStream.pipe = jest.fn().mockImplementation((writeStream: any) => {
      writeStream.write('file content');
      // Emit 'end' event before ending writeStream
      mockReadStream.emit('end');
      writeStream.end(); // emits 'finish'
    });

    const bbInstance = busboy({ headers: mockReq.headers }); // Ensure busboy is called with config

    (busboy as jest.Mock).mockReturnValue(bbInstance);

    const handlerPromise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Simulate the 'file' and 'finish' events
    bbInstance.emit('file', 'file', mockReadStream, mockFile);
    bbInstance.emit('finish');

    await handlerPromise;

    const expectedFilePath = path.join(process.cwd(), 'public/uploads', 'test_song.mp3');

    expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilePath);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'File uploaded successfully',
      filePath: '/uploads/test_song.mp3',
    });
  });

  it('should handle errors during file upload', async () => {
    const bbInstance = busboy({ headers: mockReq.headers }); // Ensure busboy is called with config

    (busboy as jest.Mock).mockReturnValue(bbInstance);

    const handlerPromise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Simulate an error during form parsing
    bbInstance.emit('error', new Error('Upload error'));

    await handlerPromise;

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing form:', expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error uploading file' });
  });

  it('should handle missing file in upload', async () => {
    const bbInstance = busboy({ headers: mockReq.headers }); // Ensure busboy is called with config

    (busboy as jest.Mock).mockReturnValue(bbInstance);

    const handlerPromise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Simulate 'finish' event without any 'file' events
    bbInstance.emit('finish');

    await handlerPromise;

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
  });

  it('should handle errors during file saving', async () => {
    const mockFile = {
      filename: 'test_song.mp3',
      encoding: '7bit',
      mimetype: 'audio/mpeg',
    };

    // Create a mockReadStream using PassThrough
    const mockReadStream = new PassThrough();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadStream.write = jest.fn().mockImplementation((chunk: any) => {
      mockReadStream.emit('data', chunk);
      return true;
    });
    mockReadStream.end = jest.fn().mockImplementation(() => {
      mockReadStream.emit('end');
    });

    // Pipe method: simulate writing data and triggering an error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadStream.pipe = jest.fn().mockImplementation((writeStream: any) => {
      writeStream.write('file content');
      // Emit 'error' on writeStream to simulate write error
      writeStream.emit('error', new Error('Write error'));
    });

    const bbInstance = busboy({ headers: mockReq.headers }); // Ensure busboy is called with config

    (busboy as jest.Mock).mockReturnValue(bbInstance);

    const handlerPromise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Simulate the 'file' and 'finish' events
    bbInstance.emit('file', 'file', mockReadStream, mockFile);
    bbInstance.emit('finish');

    await handlerPromise;

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving file:', expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error saving file' });
  });
});
