FROM debian:10 as builder 

RUN apt-get update && \ 
    apt-get install -y git build-essential

RUN git clone https://github.com/AXATechLab/pdf2json /src/pdf2json && \
    cd /src/pdf2json && \
    ./configure --prefix=/opt/pdf2json && \
    make -j && \
    make install && \
    cd /src && \
    rm -rf pdf2json


FROM debian:10 as engine

RUN apt-get update && \
    apt-get install -y mupdf mupdf-tools qpdf pandoc tesseract-ocr-all ghostscript nodejs npm python-pdfminer python-pip python3-pip python-tk python3-pdfminer python3-opencv && \
    pip install ghostscript camelot-py && \
    pip3 install ghostscript camelot-py 
    
WORKDIR /opt/app-root/src
RUN chown 1001:0 /opt/app-root/src

COPY --from=builder /opt/pdf2json /opt/pdf2json

ENV PATH $PATH:/opt/app-root/src/node_modules/.bin:/opt/pdf2json/bin
ENV HOME /opt/app-root/src

USER 1001