FROM haskell:8

RUN mkdir /duckling /log && chown 1001:0 /duckling /log


RUN apt-get update && \
    apt-get install -qq -y libpcre3 libpcre3-dev build-essential --fix-missing --no-install-recommends


USER 1001
ENV HOME /duckling

ARG DUCKLING_RELEASE=master
RUN git clone --branch=${DUCKLING_RELEASE} https://github.com/facebook/duckling.git

WORKDIR /duckling
RUN stack setup
# NOTE:`stack build` will use as many cores as are available to build
# in parallel. However, this can cause OOM issues as the linking step
# in GHC can be expensive. If the build fails, try specifying the
# '-j1' flag to force the build to run sequentially.
RUN stack build -j2

ENTRYPOINT stack exec duckling-example-exe
