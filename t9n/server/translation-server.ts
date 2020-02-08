import { logging } from '@angular-devkit/core';
import koaCors from '@koa/cors';
import Router from '@koa/router';
import { readFile } from 'fs';
import Koa from 'koa';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import { join } from 'path';
import { promisify } from 'util';

import { TranslationContext } from '../translation-context';
import { TranslationTargetUnit } from '../translation-target-unit';

import {
  ORPHAN_ROUTE,
  ORPHANS_ROUTE,
  ROOT_ROUTE,
  SOURCE_UNIT_ROUTE,
  SOURCE_UNITS_ROUTE,
  TARGET_ROUTE,
  TARGET_UNIT_ROUTE,
  TARGET_UNITS_ROUTE,
  TARGETS_ROUTE
} from './constants';
import {
  OrphanResponse,
  PaginationResponse,
  RootResponse,
  SourceUnitWithTranslationsResponse,
  TargetResponse,
  TargetsResponse,
  TargetUnitResponse
} from './responses';

const readFileAsync = promisify(readFile);

export class TranslationServer extends Koa<any, Koa.DefaultContext & Router.RouterParamContext> {
  constructor(
    private readonly _logger: logging.LoggerApi,
    private readonly _context: TranslationContext,
    appPath: string
  ) {
    super();
    this._logger.info(`Current languages: ${this._context.languages.join(', ')}\n`);
    const router = this._createApiRouter();
    this.use(koaStatic(appPath))
      .use(koaCors())
      .use(router.routes())
      .use(router.allowedMethods())
      .use(async ctx => {
        if (ctx.method === 'GET' && !ctx.path.startsWith('/api/')) {
          ctx.body = await readFileAsync(join(appPath, 'index.html'), 'utf-8');
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
      .get(TARGETS_ROUTE, '/targets', ctx => {
        ctx.body = new TargetsResponse(this._context, toUrlFactory(ctx));
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
          return ctx.throw(404, 'Target does not exist');
        }

        const unit = target.unitMap.get(id);
        if (!unit) {
          ctx.throw(404, 'Unit does not exist');
        } else {
          ctx.body = new TargetUnitResponse(target, unit, toUrlFactory(ctx));
        }
      })
      .put('/targets/:language/units/:id', koaBody(), ctx => {
        const body = ctx.request.body as Partial<TranslationTargetUnit>;
        const { language, id } = ctx.params;
        const target = this._context.target(language);
        if (!target) {
          return ctx.throw(404, 'Target does not exist');
        } else if (!target.unitMap.has(id)) {
          return ctx.throw(404, 'Unit does not exist');
        } else if (!body || typeof body.state !== 'string' || typeof body.target !== 'string') {
          return ctx.throw(400, 'Properties target and state must be strings');
        } else if (!['initial', 'translated', 'reviewed', 'final'].includes(body.state)) {
          return ctx.throw(
            400,
            `state must be one of 'initial', 'translated', 'reviewed', 'final'`
          );
        }

        const existingUnit = target.unitMap.get(id)!;
        const updatedUnit = this._context.updateTranslation(language, {
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
          return ctx.throw(404, 'Target does not exist');
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
          return ctx.throw(404, 'Target does not exist');
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
          return ctx.throw(404, 'Target does not exist');
        }

        const orphan = target.orphans.find(o => o.unit.id === id);
        if (!orphan) {
          ctx.throw(404, 'Orphan does not exist');
        } else {
          this._context.removeOrphan(language, orphan);
          ctx.status = 204;
        }
      });
  }
}
