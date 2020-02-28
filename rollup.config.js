import ts from '@wessberg/rollup-plugin-ts';

export default [
  target({ input: './t9n/index.ts', output: './t9n/main.js' }),
  target({ input: './t9n/index.ts', output: './t9n/index.js', format: 'esm' }),
  target({ input: './schematics/ng-add/index.ts' }),
  target({ input: './schematics/resolve-ng-locales/index.ts' }),
  target({ input: './builders/t9n/index.ts', exports: 'named' })
];

function target({ input, output, exports = 'auto', format = 'cjs' }) {
  return {
    input,
    output: {
      file: output || input.replace(/\.ts$/, '.js'),
      exports,
      format
    },
    external: [
      '../../t9n',
      '@angular-devkit/architect',
      '@angular-devkit/core',
      '@angular-devkit/core/node',
      '@angular-devkit/schematics',
      '@koa/cors',
      '@koa/router',
      '@schematics/angular/utility/config',
      '@schematics/angular/utility/workspace-models',
      'fs',
      'js-levenshtein',
      'koa',
      'koa-body',
      'koa-static',
      'os',
      'path',
      'util',
      'xmldom'
    ],
    plugins: [
      ts({
        browserslist: false,
        tsconfig: 'tsconfig.node.json'
      })
    ]
  };
}
