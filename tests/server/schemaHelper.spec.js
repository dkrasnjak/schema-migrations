/**
 * Created by chenrozenes on 30/12/2015.
 */
describe('SchemaHelper', function () {
  var sampleSchema = {"name":"customer","schema":{"firstName":{type: String, "label":"First Name"},"lastName":{type: String, "label":"Last Name"}}};
  var sampleSchema2 = {"name":"customer","schema":{"fullName":{type: String, "label":"Full Name"}}};

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
      expect(SchemaHelper.fetchSchemaFromFile('bla bla')).toEqual([]);

      readFileSpy.and.returnValue('not json');
      expect(SchemaHelper.fetchSchemaFromFile('bla bla')).toEqual([]);
    });

    it('returns the data in the schema file', function () {
      let toCompareSchema = SchemaHelper._normalizeSchema(sampleSchema);
      expect(SchemaHelper.fetchSchemaFromFile(process.env.PWD + '/tests/server/schema-for-tests.json')).toEqual([toCompareSchema]);
    });
  });

  describe('_buildMethod', function () {
    let schema1 = SchemaHelper._normalizeSchema(sampleSchema);
    let schema2 = SchemaHelper._normalizeSchema(sampleSchema2);

    it('returns a corresponding string when difference between the 2 schemas cannot be found', function () {
      let migrationPlanSpy = spyOn(SimpleSchemaVersioning, 'getMigrationPlan').and.callThrough();
      let expectedString =
        `
  // Could not find difference for collection customer. Auto migration not created
  `;

      expect(SchemaHelper._buildMethod(sampleSchema, sampleSchema)).toEqual(expectedString);
      expect(SimpleSchemaVersioning.getMigrationPlan).toHaveBeenCalledWith(sampleSchema.schema, sampleSchema.schema);

      migrationPlanSpy.and.returnValue({});
      expect(SchemaHelper._buildMethod(sampleSchema, sampleSchema)).toEqual(expectedString);

      migrationPlanSpy.and.returnValue({errors: []});
      expect(SchemaHelper._buildMethod(sampleSchema, sampleSchema)).toEqual(expectedString);
    });

    it('returns a valid method string', function () {
      let result = SchemaHelper._buildMethod(schema1, schema2);

      var space = '';
      var expected =
        `
  collection = db.collection('customer');
  collection.update({"$or":[{"firstName":{"$exists":true}},{"lastName":{"$exists":true}}]},
                    {"$unset":{"firstName":"","lastName":""}},
                    {multi: true}, (err) => {
    if (err) console.log('Error occurred when migrating collection customer. err=' + err);
    else console.log('customer collection migrated successfully');
  });
  ${space}
  /*
    NOTE !!! Auto migration DIDN'T go smoothly on collection: 'customer' !!!
    Follow the following errors to fix it manually:
      Cannot determine value : The added field 'fullName' does not have a default value
   */
   `;

      expect(result).toEqual(expected);
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

      var toCompareSchema = {
        firstName: {
          type: 'String',
          label: 'first name'
        },
        lastName: {
          type: 'String',
          label: 'last name'
        },
        description: {
          type: 'String',
          label: 'description'
        }
      };

      expect(SchemaHelper.findAllSchemas()).toEqual([{name: 'dummy', schema: toCompareSchema}]);
    });
  });

  describe('getUpdateMethods', function () {
    var schema1 = {"name":"customer","schema":{"fullName":{type: 'String', "label":"Full Name", defaultValue: 'Yossi Cohen'}}};
    var schema2 = {"name":"customer","schema":{"firstName":{type: 'String', "label":"First Name", defaultValue: 'Yossi'},"lastName":{type: 'String', "label":"Last Name", defaultValue: 'Cohen'}}};

    it('verify up and down object properties when schemas are empty', function () {
      var methods = SchemaHelper.getUpdateMethods([{}], [{}]);
      expect(methods.up).toBe('');
      expect(methods.down).toBe('');
    });

    it('verify correct call to buildMethod when comparing schemas', function () {
      spyOn(SchemaHelper, '_buildMethod').and.callThrough();

      SchemaHelper.getUpdateMethods([schema1], [schema2]);

      expect(SchemaHelper._buildMethod.calls.argsFor(0)).toEqual([schema1, schema2]);
      expect(SchemaHelper._buildMethod.calls.argsFor(1)).toEqual([schema2, schema1]);
    });

    it('returns empty methods when cannot find match collection', function () {
      schema1.name = 'other';
      expect(SchemaHelper.getUpdateMethods([schema1], [schema2])).toEqual({up: '', down: ''});
    });
  });
});