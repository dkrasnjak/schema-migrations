/**
 * Created by chenrozenes on 30/12/2015.
 */
describe('SchemaHelper', function () {
  describe('getSchemaFileName', function () {
    it('verify correct file name with the provided parameters', function () {
      expect(SchemaHelper.getSchemaFileName('migration-name', 1, '/path/to/file')).toEqual('/path/to/file/migration-name-1-schema.json');
      expect(SchemaHelper.getSchemaFileName('migration-name', 'version1', '/path/to/file')).toEqual('/path/to/file/migration-name-version1-schema.json');
      expect(SchemaHelper.getSchemaFileName('migration name', 'version 1', '/path/to/file')).toEqual('/path/to/file/migration name-version 1-schema.json');
    });
  });

  describe('fetchSchemaFromFile', function () {
    it('returns empty object when error occurred and cannot read file', function () {
      let readFileSpy = spyOn(FileHelper, 'readFile').and.callFake(() => { throw new Error('error for test'); });
      expect(SchemaHelper.fetchSchemaFromFile('bla bla')).toEqual({});

      readFileSpy.and.returnValue('not json');
      expect(SchemaHelper.fetchSchemaFromFile('bla bla')).toEqual({});
    });

    it('returns the data in the schema file', function () {
      let toCompare = {"name":"customer","schema":{"firstName":{"label":"First Name"},"lastName":{"label":"Last Name"}}};
      expect(SchemaHelper.fetchSchemaFromFile(process.env.PWD + '/tests/server/schema-for-tests.json')).toEqual(toCompare);
    });
  });

  describe('findAllSchemas', function () {
    it('returns empty array if there are no collections', function () {
      spyOn(Meteor.Collection, 'getAll').and.returnValue([]);
      expect(SchemaHelper.findAllSchemas()).toEqual([]);
    });

    it('returns an array of collections only defined with simple schema', function () {
      var dummySchema = {
        firstName: {
          type: String,
          label: 'first name'
        },
        lastName: {
          type: String,
          label: 'last name'
        },
        description: {
          type: String,
          label: 'description'
        }
      };

      // Creating collection with simple schema
      var dummySimpleSchema = new SimpleSchema(dummySchema);
      var dummyCollection = new Mongo.Collection("dummy");
      dummyCollection.attachSchema(dummySimpleSchema);

      // Creating collection without simple schema
      new Mongo.Collection('not_simple_schema');

      expect(SchemaHelper.findAllSchemas()).toEqual([{name: 'dummy', schema: dummySchema}]);
    });
  });

  describe('getUpdateMethods', function () {
    it('verify up and down object properties', function () {
      var methods = SchemaHelper.getUpdateMethods({}, {});
      expect(methods.up).toBeDefined();
      expect(methods.down).toBeDefined();
    });
  });
});