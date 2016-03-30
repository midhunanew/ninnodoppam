#!/bin/bash

## DEVELOPMENT
export NODE_ENV=default
./node_modules/.bin/supervisor  -e 'node,js' -i node_modules --no-restart-on error -- ./bin/www

## PRODUCTION
#export NODE_ENV=production; node bin/www
#forever stop bin/www
#forever -o logs/out.log -e logs/err.log start bin/www

## DEBUG
#export NODE_ENV=default
#DEBUG=ninnodoppam:* npm start
