# magic/root dockerfile
# VERSION 0.0.1

FROM mhart/alpine-node:5.9.1

MAINTAINER Wizards & Witches <team@wiznwit.com>
ENV REFRESHED_AT 2016-25-03

RUN apk add --no-cache git bash

WORKDIR /srv

RUN npm install --verbose magic/root

COPY ./bin/cli.sh .
