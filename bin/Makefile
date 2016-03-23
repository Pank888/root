CLI:=./node_modules/magic-root/bin/cli.sh

.PHONY: \
	all \
	build \
	clean \
	lint \
	lint-fix \
	rm \
	run

all: help

build:
	@${CLI} build

lint:
	@${CLI} lint

lint-fix:
	@${CLI} lint-fix

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