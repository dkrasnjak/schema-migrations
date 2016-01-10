/**
 * Created by chenrozenes on 27/12/2015.
 */
class MigrationsBL {
  /**
   * Main function - creates a migration file and a schema file by the parameters
   * It compares between schemas (current schema and old schema), and writes the migration file
   *
   * @param name the name of the migration to create
   * @param version the version of the migration to create
   * @param oldVersion version to compare its schema to the current
   * @param path full path to the migration dir (not including the 'migrations' folder)
   */
  static create(name, version, oldVersion, path) {
    if (_.isUndefined(oldVersion)) throw new Error('oldVersion is mandatory param');

    var currentSchema = this.createSchema(name, version, path);

    path = path + MigrationsBL.MIGRATION_DIR;

    // Fetching old schema (if not exists, returns an empty schema)
    var oldSchemaFile = SchemaHelper.getSchemaFileName(name, oldVersion, path);
    console.log('[MIGRATIONS] Fetching old schema from file: ' + oldSchemaFile);
    var oldSchema = SchemaHelper.fetchSchemaFromFile(oldSchemaFile);

    // Getting auto migration methods
    console.log('[MIGRATIONS] Comparing old and updated schemas');
    var updateMethods = SchemaHelper.getUpdateMethods(oldSchema, currentSchema);

    // Creating migration file name
    var fileName = FileHelper.getMigrationFileName(name, version, path);

    // Creating migration file content
    var fileContent = FileHelper.createFileTemplate(updateMethods.up, updateMethods.down);

    // Writing migration file
    console.log('[MIGRATIONS] Writing migrations file: ' + fileName);
    FileHelper.writeFile(fileName, fileContent);
  }

  /**
   * Creates a schema file by the parameters.
   * The function creates the migration directory if not exists, and creates a schema file by the current collections' schema
   *
   * @param name the name of the schema file to create
   * @param version the version of the schema to create
   * @param path full path to the migration dir (not including the 'migrations' folder)
   */
  static createSchema(name, version, path) {
    if (_.isUndefined(version)) throw new Error('version is mandatory param');
    check(name, String);
    check(path, String);

    if (path.trim().length === 0)
      throw new Error('path cannot be empty');

    path = path + MigrationsBL.MIGRATION_DIR;

    // Creates if not exists
    FileHelper.createMigrationsDir(path);

    // Fetching all current schema
    console.log('[MIGRATIONS] Gathering schema');
    var currentSchema = SchemaHelper.findAllSchemas();

    var schemaFileName = SchemaHelper.getSchemaFileName(name, version, path);
    // Writing schema file
    console.log('[MIGRATIONS] Writing schema file: ' + schemaFileName);
    FileHelper.writeFile(schemaFileName, JSON.stringify(currentSchema));

    return currentSchema;
  }
}

MigrationsBL.MIGRATION_DIR = '/migrations/';
this.MigrationsBL = MigrationsBL;