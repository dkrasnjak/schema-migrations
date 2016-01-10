/**
 * Created by chenrozenes on 07/01/2016.
 */
// Having the option of skipping the plug in (for package tests for example)
if (!process.env.SKIP_PLUGIN) {
  var path = Plugin.path;
  var fs = Plugin.fs;

  var meteorHome = process.env.PWD;

  var pluginDefinitionFilePath = path.resolve(meteorHome + '/.meteor/.migrations-defs.json');

  // Checking if .migrations-defs.json exists. it is mandatory for the plugin execution
  if (!fs.existsSync(pluginDefinitionFilePath)) {
    console.log('./.meteor/.migrations-defs.json not found. cannot initiate migrations package');
    console.log('For more instructions read the package README file');
    process.exit(1);
  }

  var definitionFileBuffer = fs.readFileSync(pluginDefinitionFilePath);

  try {
    // Parsing .migrations-defs file
    var migrationsDefs = JSON.parse(definitionFileBuffer);
  } catch (e) {
    console.log('Cannot parse .migrations-defs file. Are you sure its in JSON format?');
    process.exit(1);
  }

  // .migrations file must have a scriptsDir property for installation
  if (!migrationsDefs.scriptsDir) {
    console.log('.migrations-defs file has not scriptsDir property');
    console.log('For more instructions read the package README file');
    process.exit(1);
  }

  try {
    var assetsScriptsPath = path.resolve(meteorHome + '/.meteor/local/build/programs/server/assets/packages/bookmd_schema-migrations/scripts/');
    var userScriptsPath = path.resolve(meteorHome + migrationsDefs.scriptsDir);

    var files = [];

    try {
      files = fs.readdirSync(assetsScriptsPath);
    } catch (e) {
      console.log('Cannot copy schema-migrations package scripts yet. dir still not exists. Restart meteor app after all packages have been loaded (no worries its normal)');
    }

    // Just for checking if we did something this build and printing 'completed' at the end
    var oneFileCopied = false;

    // Copying package scripts to the directory specified in the .migrations-defs file and giving execution permissions
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