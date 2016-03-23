#!/usr/bin/env bash

NODE_BIN=${NODE_BIN:-node_modules/.bin}
CONTAINER_NAME=${CONTAINER_NAME:-magic-localhost}
JS_ROOT_DIR=${JS_ROOT_DIR:-src/js}
MAGIC_DIR=${MAGIC_DIR:-node_modules/magic-root}
MAGIC_BIN=${MAGIC_BIN:-node_modules/magic-root/bin}
MAGIC_NODE_BIN=${MAGIC_NODE_BIN:-node_modules/magic-root/node_modules/.bin}
NODEJS_SRC_FILES=${NODEJS_FILES:-"src/config.js src/index.js"}
NODEJS_OUT_FILE=${NODEJS_OUT_FILE:-"out/index.js"}

OUT_DIR=${OUT_DIR:-out}

function build() {
  echo "start building $CONTAINER_NAME docker container"

  build-browser-js
  build-node-js
  build-express-dirs

  docker build \
  --tag $CONTAINER_NAME \
    . # dot!

  echo "finished building docker container"
}

function build-browser-js() {
  echo "start building javascript bundles"

  mkdir -p $OUT_DIR/js

  cp -r src/js/* $OUT_DIR/js/
  echo "finished building javascript bundles"
}

function build-node-js() {
  echo "start building nodejs"

  mkdir -p $OUT_DIR/

  $MAGIC_NODE_BIN/babel \
    --out-file $NODEJS_OUT_FILE \
    $NODEJS_SRC_FILES # order is important

  echo "finished building nodejs"
}

function build-express-dirs() {
  echo "start copying express views and public dir"

  mkdir -p $OUT_DIR/

  cp -r \
    src/public src/views \
    $OUT_DIR/

  echo "finished copying express views and public dir"
}

function run() {
  docker-rm

  echo "start docker container"
  docker run \
    --name $CONTAINER_NAME \
    --detach \
    $CONTAINER_NAME
}

function ip() {
  ip=$(python $MAGIC_BIN/ip.py $CONTAINER_NAME)
  echo "container $CONTAINER_NAME started with ip: $ip"
  echo $ip > ./IP.txt
}

function docker-rm() {
  echo "delete docker container"
  docker rm -f $CONTAINER_NAME
  echo "delete docker container finished"
}

function lint() {
  echo "eslint start"
  $MAGIC_NODE_BIN/eslint \
    src
  echo "eslint done"
}

function lint-fix() {
  echo "lint-fix start"
  $MAGIC_NODE_BIN/eslint \
    --fix \
    src
  echo "lint-fix end"
}

function jade-lint() {
  echo "jade-lint start"
  $MAGIC_NODE_BIN/jade-lint \
    ./src/views/*
  echo "jade-lint finished"
}

function stylint() {
  echo "stylint start"

  $MAGIC_NODE_BIN/stylint \
    src/public/css

  echo "stylint finished"
}

function clean() {
  echo "cleaning up out dir"

  rm -rf $OUT_DIR

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

build     - build docker container
run       - run docker container
clean     - remove build library and test files
lint      - eslint javascript sources
lint-fix  - eslint and fix javascript sources
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
