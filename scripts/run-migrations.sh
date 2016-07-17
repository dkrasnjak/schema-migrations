#!/usr/bin/env bash

# Parse CLI arguments
while [[ $# > 0 ]]
do
key="$1"
echo "[Param] $1 = $2"

case $key in
  # Handle target dir
  -dir|--targetDir)
  TARGET_DIR_ARG="$2"
  shift # past value
  ;;

  # Handle config file
  -cfg|--config)
  CONFIG_FILE_ARG="$2"
  shift # past value
  ;;

  # Handle environment
  -env|--environment)
  ENVIRONMENT_ARG="$2"
  shift # past value
  ;;

  # Handle npm install
    -pkg|--packages)
    NPM_PACKAGES="$2"
    shift # past value
    ;;

  # Handle operation
  -op|--operation)
  OPERATION_ARG="$2"
  shift # past value
  ;;

  # Handle help
  -h|--help)
  HELP_ARG=1
#  shift # past argument=value
  ;;


  *)
          # unknown option
  ;;
esac
shift # past argument or value
done


if ! [ -z ${HELP_ARG} ]; then
  SCRIPT_NAME=`basename $0`
  echo "Usage: $SCRIPT_NAME options"
  echo "[-dir|--targetDir] <parent dir of the 'migrations' folder>"
  echo "-cfg|--config <json config file> "
  echo "[-env|--enrivonment] <environment to connect in config file>"
  echo "[-op|--operation] <up/down>"
  exit 0
fi

MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized

METOER_HOME='REPLACE_METEOR_HOME'

if [ -z ${NPM_PACKAGES_LOCATION} ]; then
  NPM_PACKAGES_LOCATION="$METOER_HOME/.meteor/local/build/programs/server/npm/bookmd_schema-migrations"
fi
cli_cmd="node $NPM_PACKAGES_LOCATION/node_modules/mongodb-migrate"

if ! [ -z ${TARGET_DIR_ARG} ]; then
  cd $TARGET_DIR_ARG
  WORKING_DIR=`pwd`
  cd -
else
  WORKING_DIR=`pwd`/private
fi

# Check if folder has a migration folder - must check so the node package won't create another
if ! [ -d "$WORKING_DIR/migrations" ]; then
  echo "Must have a 'migrations' folder in target folder. exiting."
  exit 1
fi

# Determing operatino to perform
if ! [ -z ${OPERATION_ARG} ]; then
  if [[ ("$OPERATION_ARG" != "up") && ("$OPERATION_ARG" != "down") ]]; then
    echo "Invalid operation. can be 'up' or 'down'"
    exit 1
  fi

  OPERATION=$OPERATION_ARG
else
  OPERATION='up'
fi

# Copying config file to our location - we'll delete it after execution
if ! [ -z ${CONFIG_FILE_ARG} ]; then
  cp $CONFIG_FILE_ARG $WORKING_DIR
  base_name="`basename $CONFIG_FILE_ARG`"
else
  echo "config file is mandatory. you can use the file described in the package documentation"
  exit 1
fi

cd $WORKING_DIR

cli_cmd="$cli_cmd --config $base_name"
COPIED_CONFIG_FILE="`pwd`/$base_name"

echo $COPIED_CONFIG_FILE

if ! [ -z ${ENVIRONMENT_ARG} ]; then
  cli_cmd="$cli_cmd --dbPropName $ENVIRONMENT_ARG"
else
  cli_cmd="$cli_cmd --dbPropName dev"
fi

cli_cmd="$cli_cmd -runmm $OPERATION"

npm_install="npm install $NPM_PACKAGES"

npm_uninstall="npm uninstall $NPM_PACKAGES"

function clearTempData() {
  # Deleting copied config file and returning to our path
  if [ -f ${COPIED_CONFIG_FILE} ]; then
    rm $COPIED_CONFIG_FILE
  fi

  cd $MY_PATH
}

trap 'clearTempData' SIGINT

## Start
echo "------- Starting migrations in $WORKING_DIR -------"
echo -e "\nDO NOT SHUT DOWN PROCESS UNTIL IT FINISHES !\n"
echo "$cli_cmd"
echo "$npm_install"
eval "$npm_install"
eval $cli_cmd
eval "$npm_uninstall"
clearTempData