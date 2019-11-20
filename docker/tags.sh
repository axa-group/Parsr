#!/bin/sh
#

set -e

case ${DRONE_BUILD_EVENT} in 
  push)
    case ${DRONE_BRANCH} in
      master)
        echo "Adding tags ${DRONE_BRANCH} to docker image"
        echo -n "${DRONE_BRANCH}" > .tags
        ;;
      develop)
        echo "Adding tag latest,develop to docker image"
        echo -n latest,develop > .tags
        ;;
    esac
    ;;
  tag)
    echo "Adding ${DRONE_TAG} tag to docker image"
    echo -n "${DRONE_TAG}" > .tags
    ;;
  *)
    echo "Unknown DRONE_BUILD_EVENT ($DRONE_BUILD_EVENT) is not defined !"
    exit 2
    ;;
esac
