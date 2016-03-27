#export NODE_ENV=production
#forever stop bin/www
#forever -o logs/out.log -e logs/err.log start bin/www
export NODE_ENV=default
DEBUG=ninnodoppam:* npm start
