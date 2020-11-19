import { promises as fs } from 'fs';

import { WorkspaceHost } from '../server';

export class AsyncWorkspaceHost implements WorkspaceHost {
  readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf8');
  }
  writeFile(path: string, data: string): Promise<void> {
    return fs.writeFile(path, data, 'utf8');
  }
  isDirectory(path: string): Promise<boolean> {
    return fs
      .stat(path)
      .then((p) => p.isDirectory())
      .catch(() => false);
  }
  isFile(path: string): Promise<boolean> {
    return fs
      .stat(path)
      .then((p) => p.isFile())
      .catch(() => false);
  }
}
