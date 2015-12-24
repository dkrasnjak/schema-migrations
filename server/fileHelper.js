/**
 * Created by chenrozenes on 29/12/2015.
 */
var fs = Npm.require('fs');

// Global async wraps to fs functions
var fsMkdir = Async.wrap(fs.mkdir);
var fsReadFile = Async.wrap(fs.readFile);
var fsWriteFile = Async.wrap(fs.writeFile);
 
/**
 * Class with helper functions to handle the files and directories needed for the migrations
 */
class FileHelper {
  /**
   * Creates the migration folder if not exists
   *
   * @param dir full path directory to create
   */
  static createMigrationsDir(dir) {
    try {
      // If throws an exception, the dir is not exists
      fs.statSync(dir);
    } catch (e) {
      console.log('[MIGRATIONS] creating migration dir: ' + dir);
      fsMkdir(dir);
    }
  }

  /**
   * Reads a file and returns its content
   *
   * @param filePath full path file name
   * @return file content
   */
  static readFile(filePath) {
    return fsReadFile(filePath);
  }

  /**
   * Writes data to a file
   *
   * @param filePath full path file name
   * @param content data to write to the file
   */
  static writeFile(filePath, content) {
    return fsWriteFile(filePath, content);
  }

  /**
   * Formats a date for the migrations file name
   *
   * @param date Date object in UTC time
   * @return A formatted string of the date
   */
  static formatDate(date) {
    return moment(date).format('YYYYMMDDHHmmss');
  }

  /**
   * Builds the migration file name with the current date
   *
   * @param name Migration name
   * @param version Migration version
   * @param path Path to create the file in
   * @returns {string} Full path file name
   */
  static getMigrationFileName(name, version, path) {
    var fileName = FileHelper.formatDate(new Date()) + '-' + name + '-' + version + '.js';
    return path + fileName;
  }

  /**
   * Creates the content of the migration file.
   * The function adds methods to the up and down actions
   *
   * @param upMethods String of methods to add to the file to the up action
   * @param downMethods String of methods to add to the file to the down action
   */
  static createFileTemplate(upMethods, downMethods) {
    upMethods = upMethods || '';
    downMethods = downMethods || '';

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
      upMethods,
      '  next();',
      '};',
      '',
      'exports.down = function (db, next) {',
      downMethods,
      '  next();',
      '};'
    ].join('\n');

    return template;
  }
}

this.FileHelper = FileHelper;