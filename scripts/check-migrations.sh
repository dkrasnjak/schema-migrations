#!/usr/bin/env bash

# Parse CLI arguments
while [[ $# > 0 ]]
do
key="$1"

case $key in
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

  # Handle help
  -h|--help)
  HELP_ARG=1
  ;;

  # Handle 'last' option
  -l|--last)
  LAST_ARG=1
  ;;

  *)
          # unknown option
  ;;
esac
shift # past argument or value
done

function usage {
  SCRIPT_NAME=`basename $0`
  echo "Usage: $SCRIPT_NAME params [options]"
  echo "Prints the migration files that ran on the requested database"
  echo "-cfg|--config <json config file> "
  echo "-env|--enrivonment <environment to connect in config file>"
  echo "[-l|--last] <prints only the last migration file that ran>"
  exit 0
}

if ! [ -z ${HELP_ARG} ]; then
  usage
  exit 0
fi

# check arguments
if [ -z "$ENVIRONMENT_ARG" ] || [ -z "$CONFIG_FILE_ARG" ]; then
  echo "Wrong arguments"
  usage
  exit 1
fi

NODE_COMMAND='JSON.parse(process.argv[1]).'$ENVIRONMENT_ARG

HOST=`node -pe $NODE_COMMAND.host "$(cat $CONFIG_FILE_ARG)"`
PORT=`node -pe $NODE_COMMAND.port "$(cat $CONFIG_FILE_ARG)"`
DATABASE=`node -pe $NODE_COMMAND.db "$(cat $CONFIG_FILE_ARG)"`
USERNAME=`node -pe $NODE_COMMAND.username "$(cat $CONFIG_FILE_ARG)"`
PASSWORD=`node -pe $NODE_COMMAND.password "$(cat $CONFIG_FILE_ARG)"`

mongo_cli_cmd="mongo --port $PORT --host $HOST"

if [[ $USERNAME != 'undefined' ]]; then
    mongo_cli_cmd="$mongo_cli_cmd -u $USERNAME"
fi

if [[ $PASSWORD != 'undefined' ]]; then
    mongo_cli_cmd="$mongo_cli_cmd -p $PASSWORD"
fi

mongo_output=`$mongo_cli_cmd << EOF | grep "name"
use $DATABASE
db.migrations.find({},{name: 1, _id: 0}).sort({executed: -1})
EOF
`

FILES=()

for i in $mongo_output; do
    ITEM=`echo $i | grep -vE "{|:|}|name" | sed "s/\"//g"`
    if [[ ! -z $ITEM ]]; then
        FILES+=($ITEM)
    fi
done

if [ ! -z $LAST_ARG ]; then
    # Printing only the last file
    echo ${FILES[0]}
else
    # Printing all files
    for file in ${FILES[@]}; do
    echo $file
    done
fi