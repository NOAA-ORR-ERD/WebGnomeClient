#!/bin/sh

# script to run the webgnome stack

# WARNING: still experimental, but it works on Chris' Mac

# start the redis server
#   the "&" lets it run in the background and keep going
redis-server &

pushd webgnomeapi
pserve config-example.ini &
popd

pushd oillibraryapi
pserve config-example.ini &
popd

pushd webgnomecli
grunt build -f
grunt serve:build
popd



