import ts from '@rollup/plugin-typescript';
import { transform } from 'typescript';

export default [
  target({ input: './builders/t9n/index.ts', exports: 'named' }),
  target({ input: './bin/index.ts' }),
  target({ input: './server/index.ts' }),
  target({ input: './schematics/ng-add/index.ts' }),
  target({ input: './schematics/resolve-ng-locales/index.ts' }),
];

function target({ input, exports = 'auto' }) {
  return {
    input,
    output: {
      file: input.replace(/\.ts$/, '.cjs'),
      exports,
      format: 'cjs',
    },
    external: [
      '@angular-devkit/architect',
      '@angular-devkit/core',
      '@angular-devkit/core/node',
      '@angular-devkit/schematics',
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-ws',
      '@nestjs/websockets',
      '@nestjs/serve-static',
      '@schematics/angular/utility/workspace',
      '@schematics/angular/utility/workspace-models',
      '@xmldom/xmldom',
      'class-validator',
      'fs',
      'js-levenshtein',
      'os',
      'path',
      'rxjs',
      'rxjs/operators',
      'util',
      '../../../server/index',
      '../../server/index',
      '../server/index',
    ],
    plugins: [
      ts({
        tsconfig: 'tsconfig.node.json',
        exclude: ['**/*.spec.ts'],
      }),
      {
        name: 'cjs-fix',
        generateBundle(options, bundle) {
          Object.values(bundle).forEach((chunk) => {
            if (chunk.imports.some((i) => i.startsWith('.'))) {
              chunk.code = chunk.code.replace(
                /require\((['"])(\.[^'"]+)\1\)/g,
                (match, quote, path) => {
                  if (!path.endsWith('.cjs')) {
                    return `require(${quote}${path}.cjs${quote})`;
                  }
                  return match;
                },
              );
            }
          });
        },
      },
    ],
  };
}
