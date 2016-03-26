#!/usr/bin/env bash

NODE_BIN=${NODE_BIN:-node_modules/.bin}
CONTAINER_NAME=${CONTAINER_NAME:-magic-localhost}
MAGIC_DIR=${MAGIC_DIR:-node_modules/magic-root}
MAGIC_BIN=${MAGIC_BIN:-node_modules/magic-root/bin}
NODEJS_SRC_FILES=${NODEJS_FILES:-"src"}
NODEJS_DIST_DIR=${NODEJS_DIST_DIR:-"dist"}

DIST_DIR=${DIST_DIR:-dist}

function dev() {
  echo "start dev environment"
  build-src

  export NODE_ENV=development;
  $NODE_BIN/nodemon \
    --exec "$NODE_BIN/babel-node src/index.js" \
    --watch ./src
}

function build() {
  echo "start building $CONTAINER_NAME docker container"

  export CACHEBUST=`git ls-remote https://github.com/magic/root.git | grep refs/heads/master | cut -f 1`
  echo "building with git hash $CACHEBUST"

  docker build \
  --tag $CONTAINER_NAME \
  --build-arg CACHEBUST=$CACHEBUST \
  --build-arg NODE_ENV=production \
    . # dot!

  echo "finished building docker container"
}

function build-src() {
  build-node-js
  build-express-dirs
}

function build-node-js() {
  echo "start building nodejs"

  mkdir -p $DIST_DIR/

  $NODE_BIN/babel \
    --out-dir $NODEJS_DIST_DIR \
    $NODEJS_SRC_FILES # order is important

  echo "finished building nodejs"
}

function build-express-dirs() {
  echo "start copying express views and public dir"

  mkdir -p $DIST_DIR/

  cp -r \
    src/public src/views \
    $DIST_DIR/

  echo "finished copying express views and public dir"
}

function run() {
  docker-rm

  echo "start docker container"
  docker run \
    --name $CONTAINER_NAME \
    --detach \
    $CONTAINER_NAME

  ip
}

function ip() {
  echo "gather ip"
  ip=$(python $MAGIC_BIN/ip.py $CONTAINER_NAME)
  echo "container $CONTAINER_NAME started with ip: $ip"
  echo $ip > ./IP.txt
  echo "ip of container is $ip"
}

function docker-rm() {
  echo "delete docker container"
  docker rm -f $CONTAINER_NAME
  echo "delete docker container finished"
}

function lint() {
  echo "start lint tasks"
  eslint
  jade-lint
  stylint
  echo "linting finished"
}

function eslint() {
  echo "eslint start"
  $NODE_BIN/eslint \
    src
  echo "eslint done"
}

function eslint-fix() {
  echo "lint-fix start"
  $NODE_BIN/eslint \
    --fix \
    src
  echo "lint-fix end"
}

function pug-lint() {
  echo "pug-lint start"
  $NODE_BIN/pug-lint \
    ./src/views/*
  echo "pug-lint finished"
}

function stylint() {
  echo "stylint start"

  $NODE_BIN/stylint \
    src/public/css

  echo "stylint finished"
}

function clean() {
  echo "cleaning up out dir"

  rm -rf $DIST_DIR

  echo "cleaning up finished"
}

function logs() {
  echo "connecting to container logs: $CONTAINER_NAME"
  docker logs --follow $CONTAINER_NAME
}

function debug() {
  docker-rm
  build

  echo "connecting to container $CONTAINER_NAME"
  docker run \
    --interactive \
    --tty \
    --name "$CONTAINER_NAME" \
    --entrypoint=sh "$CONTAINER_NAME"
}

function help() {
  echo "
make [task]

running make without task starts a dev env

dev       - run dev environment
build-src - build express app
lint      - eslint javascript sources
lint-fix  - eslint and fix javascript sources
pug-lint  - run pug-lint (html)
jade-lint - run pug-lint (html)
stylint   - run stylint (css)

build     - build docker container
run       - run docker container
clean     - remove build library and test files
debug     - connect to a debug container
logs      - tail the logs of the running container
clean     - remove out dir
docker-rm - remote docker container
"
}

if [ $1 ]
then
  function=$1
  shift
  $function $@
else
  help $@
fi
