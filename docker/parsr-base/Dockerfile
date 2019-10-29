FROM debian:10 as engine

RUN apt-get update && \
    apt-get install -y imagemagick mupdf mupdf-tools qpdf pandoc tesseract-ocr-all nodejs npm python-pdfminer python-pip python3-pip python-tk python3-pdfminer python3-opencv && \
    pip install ghostscript camelot-py && \
    pip3 install ghostscript camelot-py 
    
WORKDIR /opt/app-root/src
RUN chown 1001:0 /opt/app-root/src

ENV PATH $PATH:/opt/app-root/src/node_modules/.bin:/opt/pdf2json/bin
ENV HOME /opt/app-root/src

USER 1001