const { readdir, readFile, writeFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { brotliCompress, constants } = require('zlib');

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const brotliCompressAsync = promisify(brotliCompress);

(async () => {
  const directory = join(__dirname, 'app');
  const files = await readdirAsync(directory, { withFileTypes: true });
  const compressions = files
    .filter(f => f.isFile() && ['html', 'js', 'css'].some(e => f.name.endsWith(`.${e}`)))
    .map(f => join(directory, f.name))
    .map(async f => {
      const content = await readFileAsync(f, 'utf8');
      const compressedContent = await brotliCompressAsync(content, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY
        }
      });
      await writeFileAsync(`${f}.br`, compressedContent);
      console.log(`Brotlified ${f}`);
    });
  await Promise.all(compressions);
})();
