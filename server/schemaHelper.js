/**
 * Created by chenrozenes on 29/12/2015.
 *
 * Class with helper functions to handle the schema comparison and files
 */
class SchemaHelper {
  /**
   * Searches for all the collections that are defined with simple schema
   *
   * @returns {Array}
   */
  static findAllSchemas() {
    var collections = Meteor.Collection.getAll();
    var schemas = [];
    for (let currCollection of collections) {
      // Adding only collections that are defined by simple schema
      var currSchema = currCollection.instance.simpleSchema();
      if (!!currSchema)
        schemas.push({name: currCollection.name, schema: currSchema._schema});
    }

    return schemas;
  }

  /**
   * Builds the schema file name
   *
   * @param name Migration name
   * @param version Migration version
   * @param path full path to file
   * @returns {string}
   */
  static getSchemaFileName(name, version, path) {
    var schemaFile = name + '-' + version + '-schema.json';
    var fullPath = path + '/' + schemaFile;

    return fullPath;
  }

  /**
   * Fetches a schema from a file
   *
   * @param fileName full path file name to the schema file
   * @returns {{}}
   */
  static fetchSchemaFromFile(fileName) {
    var schema = {};

    try {
      var content = FileHelper.readFile(fileName);
      schema = JSON.parse(content);
    } catch (e) {
      console.log('[MIGRATIONS] Cannot read schema file ' + fileName + ' returning empty schema. err=' + e);
    }

    return schema;
  }

  /**
   * Compares between 2 schemas and returns the methods that need to be executed when migrating.
   * The function returns an object with methods for 'up' action and for 'down' action
   *
   * @param schema1
   * @param schema2
   * @returns {{up: string, down: string}}
   */
  static getUpdateMethods(schema1, schema2) {
    // TODO use david package here
    var methods = {up: '', down: ''};

    return methods;
  }
}

this.SchemaHelper = SchemaHelper;