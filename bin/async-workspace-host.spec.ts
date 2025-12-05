import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { AsyncWorkspaceHost } from './async-workspace-host';

describe('AsyncWorkspaceHost', () => {
  let host: AsyncWorkspaceHost;
  let directory: string;

  beforeEach(() => {
    host = new AsyncWorkspaceHost();
    directory = mkdtempSync(join(tmpdir(), 'AsyncWorkspaceHost'));
  });

  afterEach(() => {
    rmdirSync(directory, { recursive: true });
  });

  describe('readFile', () => {
    it('should return content', async () => {
      const content = 'test';
      const file = join(directory, 'file.txt');
      writeFileSync(file, content, 'utf8');
      assert.equal(await host.readFile(file), content);
    });

    it('should throw on missing file', async () => {
      await assert.rejects(async () => {
        await host.readFile('file.txt');
      });
    });
  });

  describe('writeFile', () => {
    it('should write content', async () => {
      const content = 'test';
      const file = join(directory, 'file.txt');
      await host.writeFile(file, content);
      assert.equal(readFileSync(file, 'utf8'), content);
    });
  });

  describe('isFile', () => {
    it('should return true for file', async () => {
      const file = join(directory, 'file.txt');
      writeFileSync(file, 'test', 'utf8');
      assert.equal(await host.isFile(file), true);
    });

    it('should return false for non-existant file', async () => {
      assert.equal(await host.isFile(join(directory, 'does-not-exist')), false);
    });

    it('should return false for directory', async () => {
      const dir = join(directory, 'directory');
      mkdirSync(dir);
      assert.equal(await host.isFile(dir), false);
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      const dir = join(directory, 'directory');
      mkdirSync(dir);
      assert.equal(await host.isDirectory(dir), true);
    });

    it('should return false for non-existant directory', async () => {
      assert.equal(await host.isDirectory(join(directory, 'does-not-exist')), false);
    });

    it('should return false for file', async () => {
      const file = join(directory, 'file.txt');
      writeFileSync(file, 'test', 'utf8');
      assert.equal(await host.isDirectory(file), false);
    });
  });
});
