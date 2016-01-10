#!/usr/bin/env bash

for i in "$@"
do
echo $i;
case $i in
    # Handle ci mode
  -ci|--ci)
  CI="TRUE"
  shift
  ;;

  *)
          # unknown option
  ;;
esac
done

cli_cmd="JASMINE_CLIENT_UNIT=0 JASMINE_SERVER_UNIT=0 JASMINE_CLIENT_INTEGRATION=0 JASMINE_SERVER_INTEGRATION=1"
cli_cmd="$cli_cmd SKIP_PLUGIN=1 VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter ./"

if ! [ -z ${CI} ]; then
  echo "Run in CI mode"
  cli_cmd="$cli_cmd --velocity --release velocity:METEOR@1.2.0.2_1"
fi

echo "Starting tests"
echo $cli_cmd
eval $cli_cmd