import { logging } from '@angular-devkit/core';
import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import request from 'supertest';

import { TranslationContext, TranslationFactory, TranslationOrphan } from '../translation';

import {
  OrphanMatchResponse,
  OrphanResponse,
  PaginationResponse,
  RootResponse,
  SourceUnitResponse,
  TargetResponse,
  TargetsResponse,
  TargetUnitResponse
} from './responses';
import { TranslationServer } from './translation-server';

describe('TranslationServer', () => {
  const xlf2TestPath = resolve(__dirname, '../../../test/xlf2');
  const sourceFile = join(xlf2TestPath, 'messages.xlf');
  const logger = new logging.NullLogger();
  const project = 'test';
  const indexContent = 'INDEX';
  let targetPath: string;
  let server: TranslationServer;
  let context: TranslationContext;

  function createOrphan(index = 0) {
    const target = context.target(context.source.language)!;
    const unit = target.units[index];
    const orphan: TranslationOrphan = {
      similar: [{ distance: 0, unit }],
      unit: { ...unit, id: 'orphan' }
    };
    target.orphans.push(orphan);
    return orphan;
  }

  beforeEach(async () => {
    targetPath = mkdtempSync(join(tmpdir(), 'TranslationFactory'));
    const appPath = join(targetPath, 'app');
    mkdirSync(appPath);
    writeFileSync(join(appPath, 'index.html'), indexContent, 'utf-8');
    context = await TranslationFactory.createTranslationContext({
      includeContextInTarget: true,
      logger,
      project,
      sourceFile,
      targetPath,
      targets: []
    });
    server = new TranslationServer(logger, context, appPath);
  });

  it('should return index.html for any non-api path', async () => {
    const response = await request(server.callback()).get('/any-path');
    expect(response.status).toEqual(200);
    expect(response.text).toEqual(indexContent);
  });

  it('GET /api', async () => {
    const response = await request(server.callback()).get('/api');
    expect(response.status).toEqual(200);
    const root = response.body as RootResponse;
    expect(root.project).toEqual(project);
    expect(root.sourceFile).toEqual(sourceFile);
    expect(root.sourceLanguage).toEqual(context.source.language);
  });

  it('GET /api/source/units', async () => {
    const response = await request(server.callback()).get('/api/source/units?entriesPerPage=25');
    expect(response.status).toEqual(200);
    const page = response.body as PaginationResponse<any, any>;
    expect(page.currentPage).toEqual(0);
    expect(page.entriesPerPage).toEqual(25);
    expect(page.totalEntries).toEqual(context.source.units.length);
    expect(page.totalPages).toEqual(1);
  });

  it('GET /api/source/units/:non-existant-unit => 404', async () => {
    const response = await request(server.callback()).get('/api/source/units/non-existant-unit');
    expect(response.status).toEqual(404);
  });

  it('GET /api/source/units/:id', async () => {
    const unit = context.source.units[0];
    const response = await request(server.callback()).get(`/api/source/units/${unit.id}`);
    expect(response.status).toEqual(200);
    const unitResponse = response.body as SourceUnitResponse;
    expect(unitResponse.id).toEqual(unit.id);
    expect(unitResponse.source).toEqual(unit.source);
  });

  it('GET /api/targets', async () => {
    const response = await request(server.callback()).get('/api/targets');
    expect(response.status).toEqual(200);
    const root = response.body as TargetsResponse;
    expect(root.languages).toEqual(context.languages);
  });

  it('GET /api/targets/:non-existant-target => 404', async () => {
    const response = await request(server.callback()).get('/api/targets/non-existant-target');
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/:language', async () => {
    const target = context.target(context.source.language)!;
    const response = await request(server.callback()).get(`/api/targets/${target.language}`);
    expect(response.status).toEqual(200);
    const targetResponse = response.body as TargetResponse;
    expect(targetResponse.language).toEqual(target.language);
  });

  it('POST /api/targets/:existing-language => 400', async () => {
    const target = context.target(context.source.language)!;
    const response = await request(server.callback()).post(`/api/targets/${target.language}`);
    expect(response.status).toEqual(400);
  });

  it('POST /api/targets/de', async () => {
    const response = await request(server.callback()).post('/api/targets/de');
    expect(response.status).toEqual(201);
    const targetResponse = response.body as TargetResponse;
    expect(targetResponse.language).toEqual('de');
  });

  it('GET /api/targets/:non-existant-target/units => 404', async () => {
    const response = await request(server.callback()).get('/api/targets/non-existant-target/units');
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/en/units', async () => {
    const response = await request(server.callback()).get('/api/targets/en/units');
    expect(response.status).toEqual(200);
    const page = response.body as PaginationResponse<any, any>;
    expect(page.currentPage).toEqual(0);
    expect(page.entriesPerPage).toEqual(10);
    expect(page.totalEntries).toEqual(context.source.units.length);
    expect(page.totalPages).toEqual(1);
  });

  it('GET /api/targets/en/units sort', async () => {
    const target = context.target(context.source.language)!;
    for (const sort of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
      const response = await request(server.callback()).get(`/api/targets/en/units?sort=${sort}`);
      expect(response.status).toEqual(200);
      const page = response.body as PaginationResponse<any, any>;
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map(u => u.id);
      const stringify = (value: string = '') => value.toString();
      const sortedIds = target.units
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .map(u => u.id);
      expect(responseIds).toEqual(sortedIds);
    }
  });

  it('GET /api/targets/en/units filter', async () => {
    const target = context.target(context.source.language)!;
    const unit = Object.assign(target.units[0], { description: 'description', meaning: 'meaning' });
    for (const filter of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
      const response = await request(server.callback()).get(
        `/api/targets/en/units?${filter}=${(unit as any)[filter]}`
      );
      expect(response.status).toEqual(200);
      const page = response.body as PaginationResponse<any, any>;
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map(u => u.id);
      const sortedIds = target.units
        .slice()
        .filter(u => (u as any)[filter] === (unit as any)[filter])
        .map(u => u.id);
      expect(responseIds).toEqual(sortedIds);
    }
  });

  it('GET /api/targets/:non-existant-target/units/:non-existant-unit => 404', async () => {
    const response = await request(server.callback()).get(
      '/api/targets/non-existant-target/units/non-existant-unit'
    );
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/en/units/:non-existant-unit => 404', async () => {
    const response = await request(server.callback()).get(
      '/api/targets/en/units/non-existant-unit'
    );
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/en/units/:id', async () => {
    const unit = context.target(context.source.language)!.units[0];
    const response = await request(server.callback()).get(`/api/targets/en/units/${unit.id}`);
    expect(response.status).toEqual(200);
    const unitResponse = response.body as TargetUnitResponse;
    expect(unitResponse.id).toEqual(unit.id);
    expect(unitResponse.source).toEqual(unit.source);
    expect(unitResponse.target).toEqual(unit.target);
    expect(unitResponse.state).toEqual(unit.state);
  });

  it('PUT /api/targets/:non-existant-target/units/:id => 404', async () => {
    const response = await request(server.callback())
      .put('/api/targets/non-existant-target/units/non-existant-unit')
      .send({ target: 'target', state: 'state' });
    expect(response.status).toEqual(404);
  });

  it('PUT /api/targets/en/units/:non-existant-unit => 404', async () => {
    const response = await request(server.callback())
      .put('/api/targets/en/units/non-existant-unit')
      .send({ target: 'target', state: 'state' });
    expect(response.status).toEqual(404);
  });

  it('PUT /api/targets/en/units/:id no payload => 400', async () => {
    const unit = context.target(context.source.language)!.units[0];
    const response = await request(server.callback()).put(`/api/targets/en/units/${unit.id}`);
    expect(response.status).toEqual(400);
  });

  it('PUT /api/targets/en/units/:id missing target => 400', async () => {
    const unit = context.target(context.source.language)!.units[0];
    const response = await request(server.callback())
      .put(`/api/targets/en/units/${unit.id}`)
      .send({ state: 'translated' });
    expect(response.status).toEqual(400);
  });

  it('PUT /api/targets/en/units/:id missing state => 400', async () => {
    const unit = context.target(context.source.language)!.units[0];
    const response = await request(server.callback())
      .put(`/api/targets/en/units/${unit.id}`)
      .send({ target: 'target' });
    expect(response.status).toEqual(400);
  });

  it('PUT /api/targets/en/units/:id invalid state => 400', async () => {
    const unit = context.target(context.source.language)!.units[0];
    const response = await request(server.callback())
      .put(`/api/targets/en/units/${unit.id}`)
      .send({ target: 'target', state: 'invalid' });
    expect(response.status).toEqual(400);
  });

  it('PUT /api/targets/en/units/:id', async () => {
    const target = 'target';
    const state = 'translated';
    const unit = context.target(context.source.language)!.units[0];
    expect(unit.target).not.toEqual(target);
    expect(unit.state).not.toEqual(state);
    const response = await request(server.callback())
      .put(`/api/targets/en/units/${unit.id}`)
      .send({ target, state });
    expect(response.status).toEqual(200);
    const unitResponse = response.body as TargetUnitResponse;
    expect(unitResponse.id).toEqual(unit.id);
    expect(unitResponse.source).toEqual(unit.source);
    expect(unitResponse.target).toEqual(target);
    expect(unitResponse.state).toEqual(state);
    expect(unit.target).toEqual(target);
    expect(unit.state).toEqual(state);
  });

  it('GET /api/targets/:non-existant-target/orphans => 404', async () => {
    const response = await request(server.callback()).get(
      '/api/targets/non-existant-target/orphans'
    );
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/en/orphans', async () => {
    createOrphan();
    const response = await request(server.callback()).get('/api/targets/en/orphans');
    expect(response.status).toEqual(200);
    const page = response.body as PaginationResponse<any, any>;
    expect(page.currentPage).toEqual(0);
    expect(page.entriesPerPage).toEqual(10);
    expect(page.totalEntries).toEqual(1);
    expect(page.totalPages).toEqual(1);
  });

  it('GET /api/targets/en/units sort', async () => {
    createOrphan();
    createOrphan(1);
    const target = context.target(context.source.language)!;
    for (const sort of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
      const response = await request(server.callback()).get(`/api/targets/en/orphans?sort=${sort}`);
      expect(response.status).toEqual(200);
      const page = response.body as PaginationResponse<any, any>;
      const responseIds = (page._embedded!.entries as OrphanResponse[]).map(u => u.id);
      const stringify = (value: string | number | boolean = '') => value.toString();
      const sortedIds = target.orphans
        .map(o => o.unit)
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .map(u => u.id);
      expect(responseIds).toEqual(sortedIds);
    }
  });

  it('GET /api/targets/en/units filter', async () => {
    const target = context.target(context.source.language)!;
    const unit = Object.assign(target.units[0], { description: 'description', meaning: 'meaning' });
    createOrphan();
    createOrphan(1);
    for (const filter of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
      const response = await request(server.callback()).get(
        `/api/targets/en/orphans?${filter}=${(unit as any)[filter]}`
      );
      expect(response.status).toEqual(200);
      const page = response.body as PaginationResponse<any, any>;
      const responseIds = (page._embedded!.entries as OrphanResponse[]).map(u => u.id);
      const sortedIds = target.orphans
        .map(o => o.unit)
        .slice()
        .filter(u => (u as any)[filter] === (unit as any)[filter])
        .map(u => u.id);
      expect(responseIds).toEqual(sortedIds);
    }
  });

  it('GET /api/targets/:non-existant-target/orphans/:id => 404', async () => {
    const response = await request(server.callback()).get(
      '/api/targets/non-existant-target/orphans/non-existant-unit'
    );
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/en/orphans/:non-existant-unit => 404', async () => {
    createOrphan();
    const response = await request(server.callback()).get(
      '/api/targets/en/orphans/non-existant-unit'
    );
    expect(response.status).toEqual(404);
  });

  it('GET /api/targets/en/orphans/:id', async () => {
    const orphan = createOrphan();
    const response = await request(server.callback()).get(
      `/api/targets/en/orphans/${orphan.unit.id}`
    );
    expect(response.status).toEqual(200);
    const orphanResponse = response.body as OrphanResponse;
    expect(orphanResponse.id).toEqual(orphan.unit.id);
    const similar = orphanResponse._embedded!.similar as OrphanMatchResponse[];
    expect(similar[0].id).toEqual(orphan.similar[0].unit.id);
    expect(similar[0].distance).toEqual(orphan.similar[0].distance);
  });

  it('DELETE /api/targets/:non-existant-target/orphans/:id => 404', async () => {
    const response = await request(server.callback()).delete(
      '/api/targets/non-existant-target/orphans/non-existant-unit'
    );
    expect(response.status).toEqual(404);
  });

  it('DELETE /api/targets/en/orphans/:non-existant-unit => 404', async () => {
    createOrphan();
    const response = await request(server.callback()).delete(
      '/api/targets/en/orphans/non-existant-unit'
    );
    expect(response.status).toEqual(404);
  });

  it('DELETE /api/targets/en/orphans/:id', async () => {
    const orphan = createOrphan();
    const response = await request(server.callback()).delete(
      `/api/targets/en/orphans/${orphan.unit.id}`
    );
    expect(response.status).toEqual(204);
    expect(context.target(context.source.language)!.orphans.length).toEqual(0);
  });
});
