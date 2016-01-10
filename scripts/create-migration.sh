#!/usr/bin/env bash

while [[ $# > 0 ]]
do
key="$1"
echo "[Param] $1 = $2"

case $key in
    -i|--init)
    INIT=1
#    shift # past argument
    ;;

    -n|--name)
    NAME="$2"
    shift # past argument
    ;;

    -ver|--version)
    VERSION="$2"
    shift # past argument
    ;;

    -old|--oldVersion)
    OLD_VERSION="$2"
    shift # past argument
    ;;

    -p|--path)
    MIGRATIONS_PATH="$2"
    shift # past argument
    ;;

    # Handle help
    -h|--help)
    HELP_ARG=1
#    shift # past argument=value
    ;;


    *)
            # unknown option
    ;;
esac
shift # past argument or value
done

SCRIPT_NAME=`basename $0`

function usage {
  echo "Usage: $SCRIPT_NAME params [options]"
  echo "-i|--init creates a schema file before creating the first migration"
  echo "-n|--name <migration name>"
  echo "-ver|--version <migraion version>"
  echo "-old|--oldVersion <old migraion version>"
  echo "[-p|--path] <parent dir of the 'migrations' folder"
}

if ! [ -z "$HELP_ARG" ]; then
  usage
  exit 0
fi

# Check if meteor is up. meteor must be up
if ! [ `ps -ef | grep -i meteor | wc -l` -gt 1 ]; then
  echo Meteor must be up when creating migration
  exit 1
fi

# check arguments for init mode
if ! [ -z "$INIT" ]; then
  if [ -z "$NAME" ] || [ -z "$VERSION" ]; then
    echo "Wrong arguments. for init mode please provide name and version"
    usage
    exit 1
  fi
# check arguments on regular mode
elif [ -z "$NAME" ] || [ -z "$VERSION" ] || [ -z "$OLD_VERSION" ]; then
  echo "Wrong arguments"
  usage
  exit 1
fi

# Handling path argument
if ! [ -z "$MIGRATIONS_PATH" ]; then
  ABS_PATH=`cd "$MIGRATIONS_PATH"; pwd`/
fi

# Preparing file to execute on meteor shell
TEMP_FILE=`mktemp`
if ! [ -z "$INIT" ]; then
cat << EOF > $TEMP_FILE
Meteor.call(MigrationsMethodName.MIGRATIONS_CREATE_SCHEMA_ONLY, '$NAME', $VERSION, '$ABS_PATH');
.exit
EOF
else
cat << EOF > $TEMP_FILE
Meteor.call(MigrationsMethodName.MIGRATIONS_CREATE, '$NAME', $VERSION, $OLD_VERSION, '$ABS_PATH');
.exit
EOF
fi



# Executing. It is done this way, because we must wait for meteor shell to be ready
( sleep 3; cat ${TEMP_FILE} ) | meteor shell

# Deleting temp file
rm $TEMP_FILE
