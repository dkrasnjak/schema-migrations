/**
 * Created by chenrozenes on 27/12/2015.
 */

var migrationsMethods = {};

if (Meteor.isServer) {
  migrationsMethods[MigrationsMethodName.MIGRATIONS_CREATE] = function (name, version, oldVersion ,path) {
    return MigrationsBL.create(name, version, oldVersion, path);
  }
}

Meteor.methods(migrationsMethods);