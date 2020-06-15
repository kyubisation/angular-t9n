import ts from '@wessberg/rollup-plugin-ts';

export default [
  target({ input: './builders/t9n/index.ts', exports: 'named' }),
  target({ input: './schematics/ng-add/index.ts' }),
  target({ input: './schematics/resolve-ng-locales/index.ts' }),
];

function target({ input, output, exports = 'auto', format = 'cjs' }) {
  return {
    input,
    output: {
      file: output || input.replace(/\.ts$/, '.js'),
      exports,
      format,
    },
    external: [
      '@angular-devkit/architect',
      '@angular-devkit/core',
      '@angular-devkit/core/node',
      '@angular-devkit/schematics',
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/serve-static',
      '@schematics/angular/utility/config',
      '@schematics/angular/utility/workspace-models',
      'class-validator',
      'fs',
      'js-levenshtein',
      'os',
      'path',
      'util',
      'xmldom',
    ],
    plugins: [
      ts({
        browserslist: false,
        tsconfig: 'tsconfig.node.json',
      }),
    ],
  };
}
