import { logging, Path, workspaces } from '@angular-devkit/core';

import { SerializationStrategy } from '../serialization-strategy';

export interface AngularJsonPersistanceStrategyOptions {
  logger: logging.LoggerApi;
  host: workspaces.WorkspaceHost;
  project: string;
  workspaceRoot: Path;
  sourceFile: Path;
  serializationContext: SerializationStrategy;
  targetDirectory: Path;
}
