FROM debian:10 as engine

RUN  apt-get update \
  && apt-get install -y wget gnupg2 libasound2 \
  && rm -rf /var/lib/apt/lists/*

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y imagemagick graphicsmagick mupdf mupdf-tools qpdf pandoc tesseract-ocr-all nodejs npm python-pdfminer python-pip python3-pip python-tk python3-pdfminer python3-opencv && \
    pip install ghostscript camelot-py scikit-image numpy pillow && \
    pip3 install ghostscript camelot-py scikit-image numpy pillow
    
WORKDIR /opt/app-root/src
RUN chown 1001:0 /opt/app-root/src

ENV PATH $PATH:/opt/app-root/src/node_modules/.bin
ENV HOME /opt/app-root/src

USER 1001
