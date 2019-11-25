FROM debian:10 as engine

RUN apt-get update && \
    apt-get install -y nodejs npm pipenv imagemagick graphicsmagick mupdf mupdf-tools qpdf pandoc tesseract-ocr-all
    
WORKDIR /opt/app-root/src
RUN chown 1001:0 /opt/app-root/src

ENV PATH $PATH:/opt/app-root/src/node_modules/.bin
ENV HOME /opt/app-root/src

USER 1001
