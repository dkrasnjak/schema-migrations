/**
 * Created by chenrozenes on 03/01/2016.
 */
describe('FileHelper', function () {
  var fs = Npm.require('fs');
  var currPath = process.env.PWD;

  describe('createMigrationsDir', function () {
    var dirPath = currPath + '/dummyDir/';

    it('creates a dir when not exists', function () {
      expect(() => fs.statSync(dirPath)).toThrow();
      FileHelper.createMigrationsDir(dirPath);
      expect(() => fs.statSync(dirPath)).not.toThrow();

      // Delete directory
      fs.rmdirSync(dirPath);
    });

    it('does not create a dir when already exists', function () {
      var fsMkdir = Async.wrap(fs.mkdir);
      fsMkdir(dirPath);

      expect(() => fs.statSync(dirPath)).not.toThrow();
      FileHelper.createMigrationsDir(dirPath);
      expect(() => fs.statSync(dirPath)).not.toThrow();

      // Delete directory
      fs.rmdirSync(dirPath);
    });
  });

  describe('getMigrationFileName', function () {
    it('verify correct file name', function () {
      var fileName = FileHelper.getMigrationFileName('name', 12, '/path/to/file');
      expect(fileName).toEqual('/path/to/file' + FileHelper.formatDate(new Date()) + '-' + 'name-12.js');
    });
  });

  describe('formatDate', function () {
    it('verify correct date format', function () {
      var date = new Date(2000, 10, 2, 13, 30, 25);
      expect(FileHelper.formatDate(date)).toEqual('20001102133025');
    });
  });

  describe('createFileTemplate', function () {
    it('verify template file with methods', function () {
      var template = [
        '/**',
        '  This is a generated migration file.',
        '  Auto migration was added to the up and down functions, after calculating the schema diff.',
        '  The file will run in a different node environment.',
        '',
        '  Extra migration actions should be written here by the following usage:',
        '',
        '    // Getting a collection',
        '    var collection = db.collection(\'customer\');',
        '',
        '    // Regular mongo action execution',
        '    collection.update({_id: 123}, {firstName: \'John\'}, callback);',
        '',
        '  "next" function should be called when the migration function is done.',
        '  If error occurred, "next" should be called like this: next(err)',
        '',
        '  For more info, checkout the mongo-migrate package: https://github.com/afloyd/mongo-migrate',
        ' */',
        'exports.up = function (db, next) {',
        'var collection = db.collection("customer")',
        'collection.update({_id: 123}, {firstName: "John"}, function (res) { console.log(res);});',
        '  next();',
        '};',
        '',
        'exports.down = function (db, next) {',
        'var collection = db.collection("customer")',
        'collection.update({_id: 123}, {firstName: "Cena"}, function (res) { console.log(res);});',
        '  next();',
        '};'
      ].join('\n');

      var upMethods = [
        'var collection = db.collection("customer")',
        'collection.update({_id: 123}, {firstName: "John"}, function (res) { console.log(res);});'
      ].join('\n');

      var downMethods = [
        'var collection = db.collection("customer")',
        'collection.update({_id: 123}, {firstName: "Cena"}, function (res) { console.log(res);});'
      ].join('\n');

      expect(FileHelper.createFileTemplate(upMethods, downMethods)).toEqual(template);
    });
  });

  it('verify template file without methods', function () {
    var template = [
      '/**',
      '  This is a generated migration file.',
      '  Auto migration was added to the up and down functions, after calculating the schema diff.',
      '  The file will run in a different node environment.',
      '',
      '  Extra migration actions should be written here by the following usage:',
      '',
      '    // Getting a collection',
      '    var collection = db.collection(\'customer\');',
      '',
      '    // Regular mongo action execution',
      '    collection.update({_id: 123}, {firstName: \'John\'}, callback);',
      '',
      '  "next" function should be called when the migration function is done.',
      '  If error occurred, "next" should be called like this: next(err)',
      '',
      '  For more info, checkout the mongo-migrate package: https://github.com/afloyd/mongo-migrate',
      ' */',
      'exports.up = function (db, next) {',
      '',
      '  next();',
      '};',
      '',
      'exports.down = function (db, next) {',
      '',
      '  next();',
      '};'
    ].join('\n');

    expect(FileHelper.createFileTemplate()).toEqual(template);
  });
});