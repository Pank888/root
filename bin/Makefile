CLI:=./node_modules/magic-root/bin/cli.sh

.PHONY: \
	all \
	dev \
	build \
	clean \
	lint \
	lint-fix \
	jade-lint \
	pug-lint \
	stylint \
	rm \
	run

all: help

dev:
	${CLI} dev

build:
	@${CLI} build

build-root:
	@${CLI} build-root

build-src:
	@${CLI} build-src

lint:
	@${CLI} lint

lint-fix:
	@${CLI} lint-fix

jade-lint:
	@${CLI} pug-lint

pug-lint:
	@${CLI} pug-lint

stylint:
	@${CLI} stylint

clean:
	@${CLI} clean

debug:
	@${CLI} debug

logs:
	@${CLI} logs

rm:
	@${CLI} docker-rm

run:
	@${CLI} run

ip:
	@${CLI} ip

help:
	@${CLI} help
