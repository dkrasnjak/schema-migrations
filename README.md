[![Circle CI](https://circleci.com/gh/bookmd/schema-migrations.svg?style=svg&circle-token=461785e8b633ffd75c08e055f5909cbeae73ba85)](https://circleci.com/gh/bookmd/schema-migrations)

# bookmd:schema-migrations
This package ables to perform migrations with mongodb and simple schema.   
The package is still in development

## Installation
```bash
meteor add bookmd:schema-migrations
```

### Recommended installation
We recommend to follow those installation instructions for easier usage:

1. Install the package as mentioned above.
2. Run your Meteor app so all package's assets will load
3. Create a scripts folder in your meteor app main directory
  ```bash
  mkdir scripts
  ```
  
4. Copy the package's scripts and give execution permissions
  ```bash
  cp .meteor/local/build/programs/server/assets/packages/bookmd_schema-migrations/scripts/* scripts/
  chmod +x scripts/run-migraions.sh
  chmod +x scripts/create-migration.sh
  ```

## Usage
### With our recommended installation
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

## Configuration
You'll need a configuration file with details of the database connection.  
Several environments can be set also.
Example:
  ```json
  {
    "dev" : {
      "host": "localhost",
      "db": "meteor",
      "port": "3001"
    }
  }
  ```

You can use an example configuration file located in:
  ```bash
  .meteor/local/build/programs/server/assets/packages/bookmd_schema-migrations/migrations-config.json
  ```

You can create several environments and call a different ```--environment``` when running ```run-migrations.sh``` parameter as described above.
