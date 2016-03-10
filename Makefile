NODE_BIN=node_modules/.bin/

.PHONY: \
	all \
	dev \
	build \
	clean \
	lint \
	lint-fix \
	test

all: help

dev: lint
	@echo 'babelify package and watch for changes'
	@${NODE_BIN}babel \
		src/index.js \
		--watch \
		--out-file index.js

build: lint
	@echo 'babelify package'
	@${NODE_BIN}babel \
		src/index.js \
		--out-file index.js
	@echo 'build done'

test: build
	@echo 'test start'
	@echo 'remove and readd test directory'
	@rm -rf test/*
	@mkdir test/ -p

	@echo 'building test source'
	@${NODE_BIN}babel \
		src/test/ \
		--out-dir test/
	${NODE_BIN}mocha \
		./test/index.js \
		--reporter spec \
		--ui bdd
	@echo 'test done'

lint:
	@echo 'eslint start'
	@${NODE_BIN}eslint \
		./src/
	@echo 'eslint done'

lint-fix:
	@echo 'lint-fix start'
	@${NODE_BIN}eslint \
		--fix \
		./src/
	@echo 'lint-fix end'

clean:
	@echo 'clean start'
	rm -rf \
		./index.js \
		./index.js.map \
		./test
	@echo 'clean end'

help:
	@echo " \n\
make [task] \n\
\n\
running make without task starts a dev env \n\
\n\
dev      - start dev env \n\
build    - build library \n\
clean    - remove build library and test files \n\
lint  	 - eslint javascript sources \n\
lint-fix - eslint and fix javascript sources \n\
test     - run tests \n\
"
