import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { updateWorkspace } from '@schematics/angular/utility/workspace';

import { Schema } from './schema';

export function ngAdd(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const { project, packageScript, ...options } = _options;
    return updateWorkspace((workspace) => {
      const projectName = project || Array.from(workspace.projects.keys())[0];
      const projectWorkspace = workspace.projects.get(projectName);
      if (!projectWorkspace) {
        throw new SchematicsException(`Project ${projectName} not found!`);
      }

      const target = projectWorkspace!.targets.get('t9n');
      if (target) {
        _context.logger.info(`Overwriting previous t9n entry in project ${projectName}.`);
        target.options = options as any;
      } else {
        projectWorkspace!.targets.add({
          name: 't9n',
          builder: 'angular-t9n:t9n',
          options: options as any,
        });
      }

      if (packageScript) {
        const packageJson = JSON.parse(tree.read('package.json')!.toString('utf8'));
        packageJson.scripts = { ...packageJson.scripts, t9n: `ng run ${projectName}:t9n` };
        tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
      }
    });
  };
}
