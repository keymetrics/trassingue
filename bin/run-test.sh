#!/usr/bin/env bash

# Usage: -c to report coverage

while true; do
  case $1 in
    -c)
      cover=1
      ;;

    *)
      break
  esac

  shift
done

export NODE_ENV=test
./bin/install-test-fixtures.sh

# Get test/coverage command
counter=0
function run {
  ("$(npm bin)/mocha" $* --timeout 4000 --R spec) || exit 1
}

# Run test/coverage
for test in test/test-*.js test/plugins/*.js ;
do
# not v0.12 or not koa = not (v0.12 and koa)
  if [[ ! $(node --version) =~ v0\.12\..* || ! "${test}" =~ .*trace\-(koa|google\-gax)\.js ]]
  then
    run "${test}"
  fi
done
