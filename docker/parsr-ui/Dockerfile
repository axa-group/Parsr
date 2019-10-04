FROM registry.access.redhat.com/ubi8/nodejs-10 as build

# Disable RHSM
USER root
RUN sed -i -e  's/^\(enabled\).*/\1=0/g' /etc/yum/pluginconf.d/subscription-manager.conf
USER 1001

ARG NODE_ENV=development
ARG DEV_MODE=true

ARG VUE_APP_API=${VUE_APP_API}

#COPY --chown=1001:root demo/vue-viewer /opt/app-root/src
#COPY --chown=1001:root docker/parsr-ui docker/parsr-ui

COPY --chown=1001:root . /opt/app-root/src

RUN docker/parsr-ui/build.sh


FROM nginx:stable

COPY --from=build /opt/app-root/src/demo/vue-viewer/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/parsr-ui/nginx.conf /etc/nginx/conf.d