import { normalize, virtualFs, workspaces } from '@angular-devkit/core';

import { SerializationStrategy } from './serialization-strategy';

describe('SerializationStrategy', () => {
  let host: workspaces.WorkspaceHost;
  const sourceFile = normalize('source.xlf');

  beforeEach(async () => {
    const memoryHost = new virtualFs.SimpleMemoryHost();
    host = workspaces.createWorkspaceHost(memoryHost);
  });

  it('should throw when no xliff is given', async () => {
    await host.writeFile(sourceFile, '<root></root>');
    await expect(SerializationStrategy.create(host, sourceFile)).rejects.toThrow(
      /^Only xliff is supported!/
    );
  });

  it('should throw on invalid xliff version', async () => {
    await host.writeFile(sourceFile, '<xliff version="0.1"></xliff>');
    await expect(SerializationStrategy.create(host, sourceFile)).rejects.toThrow(
      /^Unsupported xliff version!/
    );
  });

  it('should return correct serializer/deserializer for xliff 1.2', async () => {
    await host.writeFile(
      sourceFile,
      `
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
  </file>
</xliff>`
    );
    const context = await SerializationStrategy.create(host, sourceFile);
    const result = await context.deserializeSource(sourceFile);
    expect(result.language).toEqual('en');
    expect(result.unitMap.size).toEqual(0);
  });

  it('should return correct serializer/deserializer for xliff 1.2', async () => {
    await host.writeFile(
      sourceFile,
      `
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
  </file>
</xliff>`
    );
    const context = await SerializationStrategy.create(host, sourceFile);
    const result = await context.deserializeSource(sourceFile);
    expect(result.language).toEqual('en');
    expect(result.unitMap.size).toEqual(0);
  });
});
