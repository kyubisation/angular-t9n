import ts from '@wessberg/rollup-plugin-ts';

export default [
  {
    input: './schematics/ng-add/index.ts',
    output: {
      file: './schematics/ng-add/index.js',
      format: 'cjs'
    },
    external: [
      '@angular-devkit/schematics',
      '@schematics/angular/utility/config',
      '@schematics/angular/utility/workspace-models',
      'path'
    ],
    plugins: [
      ts({
        browserslist: false,
        tsconfig: 'tsconfig.node.json'
      })
    ]
  },
  {
    input: './schematics/resolve-ng-locales/index.ts',
    output: {
      file: './schematics/resolve-ng-locales/index.js',
      format: 'cjs'
    },
    external: ['@angular-devkit/core', 'fs', 'path'],
    plugins: [
      ts({
        browserslist: false,
        tsconfig: 'tsconfig.node.json'
      })
    ]
  },
  {
    input: './builders/t9n/index.ts',
    output: {
      file: './builders/t9n/index.js',
      exports: 'named',
      format: 'cjs'
    },
    external: [
      '@angular-devkit/architect',
      '@koa/cors',
      '@koa/router',
      'fs',
      'js-levenshtein',
      'koa',
      'koa-body',
      'koa-static',
      'os',
      'path',
      'rxjs',
      'rxjs/operators',
      'util',
      'xmldom'
    ],
    plugins: [
      ts({
        browserslist: false,
        tsconfig: 'tsconfig.node.json'
      })
    ]
  }
];
