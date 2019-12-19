import { logging } from '@angular-devkit/core';

export interface TranslationFactoryConfiguration {
  logger: logging.LoggerApi;
  source: string;
  targetPath: string;
  targets: string[];
  includeContextInTarget: boolean;
  encoding: string;
}
