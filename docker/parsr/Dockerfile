FROM centos:7 AS builder
USER root

RUN yum -y update && \
    yum-config-manager --enable epel && \
    yum -y groupinstall 'Development Tools' && \
    yum -y install git zlib-devel libjpeg-turbo-devel libtiff-devel libpng-devel && \
    mkdir /src && \
    cd /src

RUN git clone https://github.com/AXATechLab/pdf2json && \
    cd pdf2json && \
    ./configure --prefix=/opt/app-root && \
    make -j && \
    make install && \
    cd /src && \
    rm -rf pdf2json

RUN curl -o mupdf.tar.gz https://www.mupdf.com/downloads/archive/mupdf-1.14.0-source.tar.gz && \
    tar xvfz mupdf.tar.gz && \
    cd mupdf-1.14.0-source/ && \
    make prefix=/opt/app-root HAVE_GLUT=no -j install && \
    cd /src && \
    rm -rf mupdf-1.14.0-source


RUN curl -sL https://github.com/qpdf/qpdf/releases/download/release-qpdf-8.3.0/qpdf-8.3.0.tar.gz | tar xfz - && \
    cd qpdf-8.3.0 && \
    ./configure --prefix=/opt/app-root && \
    make -j && \
    make install && \
    cd /src && \
    rm -rf qpdf-8.3.0

RUN curl -sL https://github.com/jgm/pandoc/releases/download/2.7.3/pandoc-2.7.3-linux.tar.gz | tar xvfz - --strip-components 1 -C /opt/app-root

RUN mkdir -p /opt/app-root/share/tessdata/ && \
    git clone https://github.com/tesseract-ocr/tessdata_fast.git && \
    cd tessdata_fast && \
    cp *.traineddata /opt/app-root/share/tessdata/ && \
    cd /src && \
    rm -rf tessdata_fast

USER 1001


FROM centos/nodejs-8-centos7 as engine
USER root

RUN yum -y update && \
    yum -y install zlib libjpeg-turbo libtiff libpng ImageMagick

RUN yum-config-manager --add-repo https://download.opensuse.org/repositories/home:/Alexander_Pozdnyakov/CentOS_7/ && \
    rpm --import https://build.opensuse.org/projects/home:Alexander_Pozdnyakov/public_key && \
    yum -y update && \
    yum -y install tesseract tesseract-langpack-*

COPY --from=builder /opt/app-root/bin /opt/app-root/bin
COPY --from=builder /opt/app-root/etc /opt/app-root/etc
COPY --from=builder /opt/app-root/include /opt/app-root/include
COPY --from=builder /opt/app-root/lib /opt/app-root/lib
COPY --from=builder /opt/app-root/share /opt/app-root/share

ENV PATH=$PATH:/opt/app-root/bin
ARG DEV_MODE=true

# Copying in override assemble/run scripts
COPY .s2i/bin /tmp/scripts
COPY --chown=1001:root . /tmp/src

USER 1001

RUN /tmp/scripts/assemble && \
    mkdir -p /opt/app-root/src/demo/web-viewer/pipeline/output && \
    chmod -R g+w /opt/app-root/src/demo/web-viewer && \
    rm -rf /tmp/src
CMD /tmp/scripts/run
