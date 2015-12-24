/**
 * Created by chenrozenes on 29/12/2015.
 */
describe('MigrationsBL', function () {

  describe('create', function () {
    it('throws exception on invalid params', function () {
      expect(() => MigrationsBL.create()).toThrowError(/version and oldVersion are mandatory params/);
      expect(() => MigrationsBL.create('name')).toThrowError(/version and oldVersion are mandatory params/);
      expect(() => MigrationsBL.create('name', 12)).toThrowError(/version and oldVersion are mandatory params/);
      expect(() => MigrationsBL.create('name', 12, 12)).toThrowError(Match.Error);
      expect(() => MigrationsBL.create({}, 12, 12)).toThrowError(Match.Error);
      expect(() => MigrationsBL.create('name', 12, 12, {})).toThrowError(Match.Error);
    });

    it('creates a migrations and schema files in correct location', function () {
      var fs = Npm.require('fs');

      MigrationsBL.create('name', 1, 0, process.env.PWD);

      var fileName = FileHelper.getMigrationFileName('name', 1, process.env.PWD + '/migrations/');
      var schemaFile = SchemaHelper.getSchemaFileName('name', 1, process.env.PWD + '/migrations/');
      expect(() => fs.statSync(fileName)).not.toThrow();
      expect(() => fs.statSync(schemaFile)).not.toThrow();

      fs.unlinkSync(fileName);
      fs.unlinkSync(schemaFile);
      fs.rmdirSync(process.env.PWD + '/migrations/');
    });
  });
});