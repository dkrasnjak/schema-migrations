[![Circle CI](https://circleci.com/gh/bookmd/schema-migrations.svg?style=svg&circle-token=461785e8b633ffd75c08e055f5909cbeae73ba85)](https://circleci.com/gh/bookmd/schema-migrations)

# bookmd:schema-migrations
This package ables to perform migrations with mongodb and simple schema.   
It compares 2 schemas and creates a migration file that contains auto migration actions wherever it is possible.   
The auto migrations can be edited, you don't have to use it, it just can make your life easier when creating migrations with a lot of collections.    
The package contains scripts for an easy use also on production environment, that can give proper control on your migrations.

## Installation

1. Create a scripts folder in your meteor app:   
    ```
    mkdir scripts
    ```   

2. The package contains scripts for easier usage. So Create a ```migrations-settings.json``` file for the package installation definitions:
   ```
   {
    "scriptsDir": "relative/path/to/scripts/directory/from/meteor/home/dir"
   }
   ```
   Create the file in: ```$METEOR_HOME/migrataions-settings.json```
   
3. Install the package as mentioned above.
    ```
    meteor add bookmd:schema-migrations
    ```
4. Run your Meteor app, you'll probably get a message like that: _"Cannot copy schema-migrations package scripts yet. dir still not exists."_.   
Thats ok, because the package needs to copy its scripts to your project, and the package is not loaded yet by Meteor
5. Run your Meteor app again, now the package will copy the scripts to the directory specified in the ```migrations-settings.json``` file.

## Usage
**!! Meteor must be up while running the scripts !!**  
From your Meteor app directory, run:

1. To create migration (example)
    ```bash
    scripts/create-migration.sh --name my_migration --version 1 --oldVersion 0 --path /path/to/migrations/parent/dir
    ```
  
2. To run the migrations
    ```bash
    scripts/run-migrations.sh --config migrations.config --environment dev --op up --targetDir /path/to/migraions/parent/dir
    ```

3. Creating the first migration:   
    The package copmares between your old schema and the new one. But what to do on he first time?   
    You can run the creation script with an init parameter, and it will create your schema file to compare with the next migrations:   
    ```bash
    scripts/create-migration.sh --init --name my_migration --version 0 --path /path/to/migrations/parent/dir
    ```
    
## Configuration
You'll need a configuration file with details of the database connection.  
Several environments can be set also.
Example:
  ```json
  {
    "dev" : {
      "host": "localhost",
      "db": "meteor",
      "port": "3001",
      "username": "user name if needed",
      "password": "password if needed",
      "authOptions": "mongo auth options if needed"
    }
  }
  ```

You can use an example configuration file located in:
  ```bash
  .meteor/local/build/programs/server/assets/packages/bookmd_schema-migrations/migrations-config.json
  ```

You can create several environments and call a different ```--environment``` when running ```run-migrations.sh``` parameter as described above.

### Stop copying scripts
The package will copy the scripts to the folder specified in the ```migrations-settings.json``` file every Meteor build, unless the files exists.  
If you wish to stop it, and NOT copy the package scripts anymore, you can set an environment variable for skipping the package plug in:

```bash
    export SKIP_PLUGIN=1
```
