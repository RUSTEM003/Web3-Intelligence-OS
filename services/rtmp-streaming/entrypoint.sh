#!/bin/sh

mkdir -p /var/hls /var/dash /var/recordings

nginx -g "daemon off;"
