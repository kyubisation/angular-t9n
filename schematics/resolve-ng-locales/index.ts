import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';

import { Schema } from './schema';

export function resolveNgLocales(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const file = join(tree.getDir(_options.dist).path, 'locales.ts');
    const ngCommonPath = dirname(require.resolve('@angular/common/package.json'));
    const localesPath = join(ngCommonPath, 'locales');
    const locales = readdirSync(localesPath, { withFileTypes: true })
      .filter(d => d.isFile() && d.name.endsWith('.d.ts'))
      .map(d => d.name.replace(/\.d\.ts$/, ''));
    const content = `export const locales = [\n${locales.map(l => `  '${l}'`).join(',\n')}\n];\n`;
    if (tree.exists(file)) {
      tree.overwrite(file, content);
    } else {
      tree.create(file, content);
    }
  };
}
