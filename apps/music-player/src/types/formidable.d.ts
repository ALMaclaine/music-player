declare module 'formidable' {
  import { IncomingMessage } from 'http';

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface File {
    filepath: string;
    originalFilename: string | null;
    newFilename: string;
    [key: string]: any;
  }

  export class IncomingForm {
    uploadDir: string;
    keepExtensions: boolean;
    parse(req: IncomingMessage, callback: (err: Error | null, fields: Fields, files: Files) => void): void;
  }

  const formidable: {
    IncomingForm: typeof IncomingForm;
  };

  export default formidable;
}