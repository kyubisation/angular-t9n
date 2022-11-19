import ts from 'rollup-plugin-ts';

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
      file: input.replace(/\.ts$/, '.js'),
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
      '../../../server',
      '../../server',
      '../server',
    ],
    plugins: [
      ts({
        browserslist: false,
        tsconfig: 'tsconfig.node.json',
      }),
    ],
  };
}
