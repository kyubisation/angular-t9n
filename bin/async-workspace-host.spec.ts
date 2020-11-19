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
      expect(await host.readFile(file)).toEqual(content);
    });

    it('should throw on missing file', async () => {
      try {
        await host.readFile('file.txt');
        fail();
      } catch {}
    });
  });

  describe('writeFile', () => {
    it('should write content', async () => {
      const content = 'test';
      const file = join(directory, 'file.txt');
      await host.writeFile(file, content);
      expect(readFileSync(file, 'utf8')).toEqual(content);
    });
  });

  describe('isFile', () => {
    it('should return true for file', async () => {
      const file = join(directory, 'file.txt');
      writeFileSync(file, 'test', 'utf8');
      expect(await host.isFile(file)).toBeTruthy();
    });

    it('should return false for non-existant file', async () => {
      expect(await host.isFile(join(directory, 'does-not-exist'))).toBeFalsy();
    });

    it('should return false for directory', async () => {
      const dir = join(directory, 'directory');
      mkdirSync(dir);
      expect(await host.isFile(dir)).toBeFalsy();
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      const dir = join(directory, 'directory');
      mkdirSync(dir);
      expect(await host.isDirectory(dir)).toBeTruthy();
    });

    it('should return false for non-existant directory', async () => {
      expect(await host.isDirectory(join(directory, 'does-not-exist'))).toBeFalsy();
    });

    it('should return false for file', async () => {
      const file = join(directory, 'file.txt');
      writeFileSync(file, 'test', 'utf8');
      expect(await host.isDirectory(file)).toBeFalsy();
    });
  });
});
