#!/usr/bin/env node

const [, , initOrConfig, configName] = process.argv;

if (initOrConfig === 'init') {
  require('./index').init(configName);
} else if (process.argv.some((a) => ['--help', '-h'].includes(a))) {
  help();
} else if (initOrConfig) {
  require('./index')
    .runT9nStandalone(initOrConfig)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  help();
}

function help() {
  console.log('ng-t9n');
  console.log('------');
  console.log('');
  console.log('Usage: ng-t9n init [config-name]');
  console.log('');
  console.log('  Create a config file to use with angular-t9n');
  console.log('');
  console.log('Usage: ng-t9n <config-file>');
  console.log('');
  console.log('  Start angular-t9n with the given configuration');
  console.log('');
  console.log('Options:');
  console.log('');
  console.log('  -h, --help          Display this usage info');
  console.log('');
}
