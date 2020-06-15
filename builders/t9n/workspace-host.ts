import { workspaces } from '@angular-devkit/core';

export abstract class WorkspaceHost implements workspaces.WorkspaceHost {
  abstract readFile(path: string): Promise<string>;
  abstract writeFile(path: string, data: string): Promise<void>;
  abstract isDirectory(path: string): Promise<boolean>;
  abstract isFile(path: string): Promise<boolean>;
}
