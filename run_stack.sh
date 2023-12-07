#!/bin/sh

# script to run the webgnome stack
# It assumes that you're in an environment with everything
# installed.

# Theoretically, it should work on any *nix system
# It assumes that wbgnomeclient and webgnomeapi are
# in the same dir

# start this script from the webgnomeclient dir:

# ./run_stack.sh

# then you shoujld be able to point your browser to:
#  http://localhost:8080

# WARNING: still experimental, but it works on Chris' Mac


# start the redis server
#   the "&" lets it run in the background and keep going
redis-server &

pushd ../webgnomeapi
pserve config-example.ini &
popd

# pushd webgnomeclient
grunt develop
# popd



