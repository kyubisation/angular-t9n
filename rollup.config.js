import ts from '@wessberg/rollup-plugin-ts';

export default [
  target('./schematics/ng-add/index.ts'),
  target('./schematics/resolve-ng-locales/index.ts'),
  target('./builders/t9n/index.ts', 'named')
];

function target(input, exports = 'auto') {
  return {
    input,
    output: {
      file: input.replace(/\.ts$/, '.js'),
      exports,
      format: 'cjs'
    },
    external: [
      '@angular-devkit/architect',
      '@angular-devkit/core',
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
