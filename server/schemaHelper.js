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
        schemas.push({name: currCollection.name, schema: this._normalizeSchema(currSchema._schema)});
    }

    return schemas;
  }

  /**
   * Replaces function and object type values with their type name.
   * For example: String is actually a function (string object), it will replace it with 'String'
   * @param schema
   * @returns {*}
   * @private
   */
  static _normalizeSchema(schema) {
    return _.each(schema, (propertyValue, key) => {
      let normalizedValue = propertyValue;

      if (typeof propertyValue == 'function')
        normalizedValue = propertyValue.name;
      else if (typeof propertyValue == 'object')
        normalizedValue = this._normalizeSchema(propertyValue);

      schema[key] = normalizedValue;
    });
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
   * @returns {Array}
   */
  static fetchSchemaFromFile(fileName) {
    var schema = [];

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
    var methods = {up: '', down: ''};

    for (let currSchema of schema1) {
      // Finding the curr collection's new version in the schema2 array
      var collNewVer = _.findWhere(schema2, {name: currSchema.name});

      // If there is no new version - probably the collection deleted
      if (!collNewVer)
        continue;

      // Creating up and down methods for this collection (this schema)
      var upMethod = this._buildMethod(currSchema, collNewVer);
      var downMethod = this._buildMethod(collNewVer, currSchema);

      methods.up = methods.up.concat(upMethod);
      methods.down = methods.down.concat(downMethod);
    }

    return methods;
  }

  /**
   * Compares a 2 single schemas and creates the method string for updating in the migration file.
   * The string method is actually the auto migration step needed for migrating from singleSchema1 and singleSchema2
   * @param singleSchema1
   * @param singleSchema2
   * @returns {*}
   * @private
   */
  static _buildMethod(singleSchema1, singleSchema2) {
    // Compare the 2 schemas and get the actions
    var actions = SimpleSchemaVersioning.getMigrationPlan(singleSchema1.schema, singleSchema2.schema);

    var method = null;

    // Checking if any actions are needed
    if (!actions || !actions.update) {
      method =
        `
  // Could not find difference for collection ${singleSchema1.name}. Auto migration not created
  `;
    } else {
      method =
        `
  collection = db.collection('${singleSchema1.name}');
  collection.update(${JSON.stringify(actions.update[0])},
                    ${JSON.stringify(actions.update[1])},
                    {multi: true}, (err) => {
    if (err) console.log('Error occurred when migrating collection ${singleSchema1.name}. err=' + err);
    else console.log('${singleSchema1.name} collection migrated successfully');
  });
  `;
    }

    // If we have some errors on our auto migration, we'll append it
    if (!!actions && !!actions.errors && actions.errors.length !== 0) {
      var errors = _.map(actions.errors, (current) => {
        return current.reason + ' : ' + current.details;
      });

      var errorsString = errors.join('\n\t\t\t');
      var errorMsg=
        `
  /*
    NOTE !!! Auto migration DIDN'T go smoothly on collection: '${singleSchema1.name}' !!!
    Follow the following errors to fix it manually:
      ${errorsString}
   */
   `;

      method = method.concat(errorMsg);
    }

    return method;
  }
}

this.SchemaHelper = SchemaHelper;