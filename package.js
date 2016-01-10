/**
 * Created by moran on 11/3/15.
 */
Package.describe({
  name: 'bookmd:schema-migrations',
  version: '0.0.9',
  summary: 'Auto database migrations with mongodb and simple schema',
  git: 'https://github.com/bookmd/schema-migrations'
});

Npm.depends({
  "mongodb-migrate": "1.2.3"
});

Package.registerBuildPlugin({
  name: "initializing-schema-migrations-support",
  sources: [
    'plugin/initMigrations.js'
  ]
});

Package.onUse(function (api) {
  api.use([
    'ecmascript@0.1.0',
    'check@1.0.6',
    'stevezhu:lodash@3.0.0',
    'meteorhacks:async@1.0.0',
    'dburles:mongo-collection-instances@0.3.4',
    'momentjs:moment@2.10.6',
    'davidyaha:simple-schema-versioning@0.0.2'
  ]);

  api.addFiles([
    'server/requireNpmMigrations.js',
    'server/fileHelper.js',
    'server/schemaHelper.js',
    'server/migrationsBL.js',
    'server/methodName.js',
    'server/methods.js'
  ], 'server');

  // Adding scripts as assets
  api.addAssets([
    'scripts/create-migration.sh',
    'scripts/run-migrations.sh',
    'migrations-config.json'
  ], 'server');
});

Package.onTest(function (api) {
  api.use([
    'ecmascript@0.1.0',
    'stevezhu:lodash@3.0.0',
    'check@1.0.6',
    'sanjo:jasmine@0.16.4',
    'meteorhacks:async@1.0.0',
    'aldeed:collection2@2.5.0',
    'davidyaha:simple-schema-versioning@0.0.2',
    'bookmd:schema-migrations@0.0.9'
  ]);

  api.addFiles([
    'tests/server/schemaHelper.spec.js',
    'tests/server/fileHelper.spec.js',
    'tests/server/migrationsBL.spec.js'
  ], 'server');


});