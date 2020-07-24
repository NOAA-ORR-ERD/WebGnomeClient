#!/bin/sh

cd /webgnomeclient
grunt build -f
grunt serve:build
