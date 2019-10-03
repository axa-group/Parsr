FROM axarev/parsr-base 

ENV NODE_ENV development

EXPOSE 3001

COPY --chown=1001:0 . /opt/app-root/src

RUN docker/parsr/build.sh
CMD docker/parsr/run.sh