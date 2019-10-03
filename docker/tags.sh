#!/bin/sh

set -e

case ${DRONE_BRANCH} in
  master)
    echo "Add \"stable\" tag"
    echo -n stable > .tags
    ;;
  develop)
    echo "Add \"latest,develop\" tag"
    echo -n latest,develop > .tags
    ;;
  
esac