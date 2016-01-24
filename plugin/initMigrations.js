/**
 * Created by chenrozenes on 07/01/2016.
 */
// Having the option of skipping the plug in (for package tests for example)
if (!process.env.SKIP_MIGRATIONS_COPY) {
  var path = Plugin.path;
  var fs = Plugin.fs;

  var meteorHome = process.env.PWD;

  var pluginDefinitionFilePath = path.resolve(meteorHome + '/migrations-settings.json');

  // Checking if migrations-settings.json exists. If not, will use default settings
  if (fs.existsSync(pluginDefinitionFilePath)) {

    var definitionFileBuffer = fs.readFileSync(pluginDefinitionFilePath);

    try {
      // Parsing migrations-settings file
      var migrationsSettings = JSON.parse(definitionFileBuffer);
    } catch (e) {
      console.log('Cannot parse migrations-settings file. Are you sure its in JSON format?');
      process.exit(1);
    }

    // .migrations file must have a scriptsDir property for installation
    if (!migrationsSettings.scriptsDir) {
      console.log('migrations-settings file has no scriptsDir property');
      console.log('For more instructions read the package README file');
      process.exit(1);
    }
  }

  try {
    var assetsScriptsPath = path.resolve(meteorHome + '/.meteor/local/build/programs/server/assets/packages/bookmd_schema-migrations/scripts/');
    var userScriptsPath = path.resolve(meteorHome + (migrationsSettings ? migrationsSettings.scriptsDir : '/scripts/migrations'));

    ensureDirExists(userScriptsPath);

    var files = [];

    try {
      files = fs.readdirSync(assetsScriptsPath);
    } catch (e) {
      console.log('Cannot copy schema-migrations package scripts yet. dir still not exists. Restart meteor app after all packages have been loaded (no worries its normal)');
    }

    // Just for checking if we did something this build and printing 'completed' at the end
    var oneFileCopied = false;

    // Copying package scripts to the directory specified in the migrations-settings file and giving execution permissions
    for (var i=0, len=files.length; i<len ; i++) {
      var file = files[i];
      var fullAssetFileName = path.resolve(assetsScriptsPath, file);
      var fullUserFileName = path.resolve(userScriptsPath, file);

      // Not copying if file exists
      if (!fs.existsSync(fullUserFileName)) {
        oneFileCopied = true;
        var isDir = fs.statSync(fullAssetFileName).isDirectory();
        if (!isDir) {
          // Replace 'REPLACE_METEOR_HOME' in files to get path to Meteor's home directory
          var newScript = fs.readFileSync(fullAssetFileName, 'utf8').replace(/REPLACE_METEOR_HOME/g, meteorHome);
          fs.writeFileSync(fullUserFileName, newScript);

          // Giving execution permissions to file
          fs.chmodSync(fullUserFileName, '555');
          console.log(file + ' copied to ' + userScriptsPath);
        }
      }
    }

    if (oneFileCopied)
      console.log('schema-migrations initialization completed!');
  } catch (e) {
    console.log('Error occurred and schemas-migrations cannot be installed. err=' + e);
  }
}

function ensureDirExists(pathToDir) {
  // Checking for empty paths
  if (!pathToDir) {
    console.log('No path specified for scripts dir');
    process.exit(1);
  }

  // Stops when dir resolves to root, current or previous dir.
  if (pathToDir && (pathToDir === '/' || pathToDir === '.' || pathToDir === '..'))
    return true;

  var retValue = fs.existsSync(pathToDir);

  // if the current dir path does not exist, making sure that the parent dir exists before creating the current dir.
  if (!retValue && ensureDirExists(path.dirname(pathToDir))) {
    try {
      fs.mkdirSync(pathToDir);
      retValue = true
    } catch (err) {
      console.log('Couldn\'t create dir', pathToDir, 'due to the following error', err);
    }
  }

  return retValue;
}