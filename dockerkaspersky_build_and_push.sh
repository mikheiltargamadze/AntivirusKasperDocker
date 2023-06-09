#!/bin/bash
build_date=$(date +%Y%m%d)
docker build --no-cache -t "dotin/kaspersky:${build_date}" -f Dockerfile .
docker login
docker push "dotin/kaspersky:${build_date}"
docker tag "dotin/kaspersky:${build_date}" "dotin/kaspersky:latest"
docker push "dotin/kaspersky:latest"


