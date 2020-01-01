import { noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';
import { ProjectType, WorkspaceProject } from '@schematics/angular/utility/workspace-models';
import { dirname } from 'path';

import { Schema } from './schema';

export function ngAdd(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const { project, packageScript, ...options } = _options;
    if (!options.targetTranslationPath) {
      const dir = dirname(options.translationFile);
      options.targetTranslationPath = dir === '.' ? '' : dir;
    }

    const workspace = getWorkspace(tree);
    const projectName = project || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const projectWorkspace = workspace.projects[projectName] as WorkspaceProject<
      ProjectType.Application
    >;
    if (!projectWorkspace.architect) {
      projectWorkspace.architect = {};
    }

    if (projectWorkspace.architect['t9n']) {
      _context.logger.info(`The project ${projectName} already has an entry for 't9n'.`);
      return noop();
    }

    projectWorkspace.architect['t9n'] = {
      builder: 'angular-t9n:t9n',
      options
    };

    if (packageScript) {
      const packageJson = JSON.parse(tree.read('package.json')!.toString('utf8'));
      packageJson.scripts = { ...packageJson.scripts, t9n: `ng run ${projectName}:t9n` };
      tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
    }

    return updateWorkspace(workspace);
  };
}
