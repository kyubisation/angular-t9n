import { logging } from '@angular-devkit/core';
import koaCors from '@koa/cors';
import Router from '@koa/router';
import { readFile } from 'fs';
import Koa from 'koa';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import { Server, Socket } from 'net';
import { join } from 'path';
import { Observable, Subject } from 'rxjs';
import { promisify } from 'util';

import { TranslationContext, TranslationTargetUnit } from '../translation';

import {
  ORPHAN_ROUTE,
  ORPHANS_ROUTE,
  ROOT_ROUTE,
  SOURCE_UNIT_ROUTE,
  SOURCE_UNITS_ROUTE,
  TARGET_ROUTE,
  TARGET_UNIT_ROUTE,
  TARGET_UNITS_ROUTE
} from './constants';
import {
  OrphanResponse,
  PaginationResponse,
  RootResponse,
  SourceUnitWithTranslationsResponse,
  TargetResponse,
  TargetUnitResponse
} from './responses';

const readFileAsync = promisify(readFile);

export class TranslationServer {
  readonly shutdown: Observable<void>;

  private _connections: { [key: string]: Socket } = {};
  private _shutdown = new Subject<void>();
  private _server: Server;

  constructor(
    private readonly _logger: logging.LoggerApi,
    private readonly _context: TranslationContext,
    private readonly _port: number
  ) {
    this._logger.info(`Current languages: ${this._context.languages.join(', ')}\n`);
    this._server = this._createServer();
    this.shutdown = this._shutdown.asObservable();
  }

  private _createServer() {
    const server = this._createApp().listen(this._port, () =>
      this._logger.info(`Translation server started: http://localhost:${this._port}\n`)
    );
    server.on('connection', connection => {
      const key = `${connection.remoteAddress}:${connection.remotePort}`;
      this._connections[key] = connection;
      connection.on('close', () => delete this._connections[key]);
    });
    return server;
  }

  private _createApp() {
    const dist = join(__dirname, '../../dist');
    const router = this._createApiRouter();
    return new Koa()
      .use(koaStatic(dist))
      .use(koaCors())
      .use(router.routes())
      .use(router.allowedMethods())
      .use(async ctx => {
        if (ctx.method === 'GET' && ctx.status !== 404) {
          ctx.body = await readFileAsync(join(dist, 'index.html'), 'utf8');
        }
      });
  }

  private _createApiRouter() {
    const toUrlFactory = (ctx: Koa.ParameterizedContext<any, Router.RouterParamContext>) => (
      name: string,
      params: any = {},
      options?: Router.UrlOptionsQuery
    ) => `${ctx.protocol}://${ctx.host}${ctx.router.url(name, params, options)}`;
    return new Router({ prefix: '/api' })
      .delete('/', async () => {
        this._logger.info('\nClosing connections');
        await new Promise((resolve, reject) => {
          this._server.close(err => (err ? reject(err) : resolve()));
          Object.values(this._connections).forEach(c => c.destroy());
        });
        this._logger.info('Shutting down translation server');
        this._shutdown.next();
        this._shutdown.complete();
      })
      .get(ROOT_ROUTE, '/', ctx => {
        ctx.body = new RootResponse(this._context, toUrlFactory(ctx));
      })
      .get(SOURCE_UNITS_ROUTE, '/source/units', ctx => {
        ctx.body = new PaginationResponse({
          query: ctx.query,
          entries: this._context.source.units,
          responseMapper: unit =>
            new SourceUnitWithTranslationsResponse(unit, this._context, toUrlFactory(ctx)),
          urlFactory: query => ctx.router.url(SOURCE_UNITS_ROUTE, { query })
        });
      })
      .get(SOURCE_UNIT_ROUTE, '/source/units/:id', ctx => {
        const unit = this._context.source.unitMap.get(ctx.params.id);
        if (!unit) {
          ctx.throw(404, 'Source unit does not exist');
        } else {
          ctx.body = new SourceUnitWithTranslationsResponse(unit, this._context, toUrlFactory(ctx));
        }
      })
      .get(TARGET_ROUTE, '/targets/:language', ctx => {
        const { language } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
        } else {
          const counter = { initial: 0, translated: 0, reviewed: 0, final: 0 };
          target.units.forEach(u => ++counter[u.state]);
          ctx.body = new TargetResponse(target, toUrlFactory(ctx));
        }
      })
      .post('/targets/:language', async ctx => {
        const { language } = ctx.params;
        const existingTarget = this._context.target(language);
        if (existingTarget) {
          ctx.throw(400, 'Target already exists');
        } else {
          const target = await this._context.createTarget(language);
          ctx.body = new TargetResponse(target, toUrlFactory(ctx));
          ctx.set('Location', toUrlFactory(ctx)(TARGET_ROUTE, { language }));
          ctx.status = 201;
        }
      })
      .get(TARGET_UNITS_ROUTE, '/targets/:language/units', ctx => {
        const { language } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
        } else {
          ctx.body = new PaginationResponse({
            query: ctx.query,
            entries: target.units,
            responseMapper: unit => new TargetUnitResponse(target, unit, toUrlFactory(ctx)),
            urlFactory: query => ctx.router.url(TARGET_UNITS_ROUTE, { language }, { query }),
            sortables: {
              id: (a, b) => (a.id || '').localeCompare(b.id || ''),
              description: (a, b) => (a.description || '').localeCompare(b.description || ''),
              meaning: (a, b) => (a.meaning || '').localeCompare(b.meaning || ''),
              source: (a, b) => (a.source || '').localeCompare(b.source || ''),
              target: (a, b) => (a.target || '').localeCompare(b.target || ''),
              state: (a, b) => (a.state || '').localeCompare(b.state || '')
            },
            filterables: {
              id: f => e => (e.id ? e.id.includes(f) : false),
              description: f => e => (e.description ? e.description.includes(f) : false),
              meaning: f => e => (e.meaning ? e.meaning.includes(f) : false),
              source: f => e => (e.source ? e.source.includes(f) : false),
              target: f => e => (e.target ? e.target.includes(f) : false),
              state: f => e => (e.state ? e.state.includes(f) : false)
            }
          });
        }
      })
      .get(TARGET_UNIT_ROUTE, '/targets/:language/units/:id', ctx => {
        const { language, id } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
          return;
        }

        const unit = target.unitMap.get(id);
        if (!unit) {
          ctx.throw(404, 'Unit does not exist');
        } else {
          ctx.body = new TargetUnitResponse(target, unit, toUrlFactory(ctx));
        }
      })
      .put('/targets/:language/units/:id', koaBody(), async ctx => {
        const body = ctx.request.body as Partial<TranslationTargetUnit>;
        const { language, id } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
          return;
        } else if (!target.unitMap.has(id)) {
          ctx.throw(404, 'Unit does not exist');
          return;
        } else if (!body || typeof body.state !== 'string' || typeof body.target !== 'string') {
          ctx.throw(400, 'Properties target and state must be strings');
          return;
        } else if (!['initial', 'translated', 'reviewed', 'final'].includes(body.state)) {
          ctx.throw(400, `state must be one of 'initial', 'translated', 'reviewed', 'final'`);
          return;
        }

        const existingUnit = target.unitMap.get(id)!;
        const updatedUnit = await this._context.updateTranslation(language, {
          id,
          source: existingUnit.source,
          target: body.target,
          state: body.state
        });
        ctx.body = new TargetUnitResponse(target, updatedUnit, toUrlFactory(ctx));
      })
      .get(ORPHANS_ROUTE, '/targets/:language/orphans', ctx => {
        const { language } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
          return;
        }

        ctx.body = new PaginationResponse({
          query: ctx.query,
          entries: target.orphans,
          responseMapper: orphan => new OrphanResponse(target, orphan, toUrlFactory(ctx)),
          urlFactory: query => ctx.router.url(ORPHANS_ROUTE, { language }, { query }),
          sortables: {
            id: (a, b) => (a.unit.id || '').localeCompare(b.unit.id || ''),
            description: (a, b) =>
              (a.unit.description || '').localeCompare(b.unit.description || ''),
            meaning: (a, b) => (a.unit.meaning || '').localeCompare(b.unit.meaning || ''),
            source: (a, b) => (a.unit.source || '').localeCompare(b.unit.source || ''),
            target: (a, b) => (a.unit.target || '').localeCompare(b.unit.target || ''),
            state: (a, b) => (a.unit.state || '').localeCompare(b.unit.state || '')
          },
          filterables: {
            id: f => e => (e.unit.id ? e.unit.id.includes(f) : false),
            description: f => e => (e.unit.description ? e.unit.description.includes(f) : false),
            meaning: f => e => (e.unit.meaning ? e.unit.meaning.includes(f) : false),
            source: f => e => (e.unit.source ? e.unit.source.includes(f) : false),
            target: f => e => (e.unit.target ? e.unit.target.includes(f) : false),
            state: f => e => (e.unit.state ? e.unit.state.includes(f) : false)
          }
        });
      })
      .get(ORPHAN_ROUTE, '/targets/:language/orphans/:id', ctx => {
        const { language, id } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
          return;
        }

        const orphan = target.orphans.find(o => o.unit.id === id);
        if (!orphan) {
          ctx.throw(404, 'Unit does not exist');
        } else {
          ctx.body = new OrphanResponse(target, orphan, toUrlFactory(ctx));
        }
      })
      .delete('/targets/:language/orphans/:id', ctx => {
        const { language, id } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          ctx.throw(404, 'Target does not exist');
          return;
        }

        const index = target.orphans.findIndex(o => o.unit.id === id);
        if (index < 0) {
          ctx.throw(404, 'Orphan does not exist');
        } else {
          target.orphans.splice(index, 1);
          ctx.status = 204;
        }
      });
  }
}
