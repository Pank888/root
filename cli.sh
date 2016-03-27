#!/usr/bin/env bash

NODE_BIN=node_modules/.bin

SRC_GLOB=src
DIST_DIR=dist

function dev() {
  lint

  echo 'babelify package and watch for changes'
  $NODE_BIN/babel \
  $SRC_GLOB \
    --watch \
    --source-maps \
    --source-root ./src/index.js \
    --out-dir $DIST_DIR
}

function build() {
  lint

  echo "babelify package"

  $NODE_BIN/babel \
    $SRC_GLOB \
    --source-maps \
    --source-root ./src/index.js \
    --out-dir $DIST_DIR

  echo "build done"
}

function test() {
  build

  echo "test start"
  echo "remove and readd test directory"
  rm -rf test/*
  mkdir test/ -p

  echo "building test source"
  $NODE_BIN/babel \
    src/test/ \
    --out-dir test/
  $NODE_BIN/mocha \
    ./test/index.js \
    --reporter spec \
    --ui bdd
  echo "test done"
}

function lint() {
  echo "eslint start"
  $NODE_BIN/eslint \
    $SRC_GLOB
  echo "eslint done"
}

function lint-fix() {
  echo "lint-fix start"
  $NODE_BIN/eslint \
    --fix \
    $SRC_GLOB
  echo "lint-fix end"
}

function clean() {
  echo "clean start"
  rm -rf \
    ./dist \
    ./test
  echo "clean end"
}

function run() {
  node dist/index.js
}

function docker-build() {
  echo "start building magic:root docker image"

  cd ./node_modules/magic-root/ && \
  docker build \
    --tag magic:root \
    . #dot!

  echo "docker magic-root build finished"
}

function docker-rm() {
  echo "docker removing magic:root image"

  docker rmi magic:root || echo "image does not exist"

  echo "docker removing magic:root finished"
}

function help() {
  echo "
make [task]

running make without task starts a dev env

dev          - start dev env
build        - build library
clean        - remove build library and test files
lint         - eslint javascript sources
lint-fix     - eslint and fix javascript sources
test         - run tests
docker-build - build docker image
docker-rm    - remove docker image
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
