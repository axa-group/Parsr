[![Build Status](https://cloud.drone.io/api/badges/axa-group/Parsr/status.svg)](https://cloud.drone.io/axa-group/Parsr)

# Parsr: Turn your documents into data!

[中文](README_zh-cn.md)

**Parsr**, is a minimal-footprint document (image, pdf) cleaning, parsing and extraction toolchain which generates readily available, organized and usable data for data scientists and developers.

It provides users with clean structured and label-enriched information set for ready-to-use applications ranging from data entry and document analysis automation, archival, and many others.

- [Parsr: Turn your documents into data!](#parsr-turn-your-documents-into-data)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Documentation](#documentation)
  - [Contribute](#contribute)
  - [Third Party Licenses](#third-party-licenses)
  - [License](#license)

## Getting Started

*-- The advanced installation guide is available [here](docs/installation.md) --*

The quickest way to install Parsr is using the [docker installation](docs/docker.md#1-run-parsr).

Otherwise, Parsr can also be installed manually.

First, install the dependencies:

**Under Linux: (Ubuntu/Debian)**

```sh
sudo add-apt-repository ppa:ubuntuhandbook1/apps
sudo apt-get update
sudo apt-get install nodejs npm qpdf imagemagick graphicsmagick python-pdfminer tesseract-ocr libtesseract-dev python3-tk ghostscript python3-pip
pip install camelot-py
```

**Under MacOS (requires [Homebrew](http://brew.sh))**

```sh
brew install node qpdf imagemagick graphicsmagick tesseract tesseract-lang
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
pip install pdfminer.six
pip install ghostscript camelot-py
```

**Under Windows**

See [our guide](docs/installation.md#13-windows) for the step by step Windows installation procedure.


## Usage

*-- The advanced usage guide is available [here](docs/usage.md) --*

1. First, clone the respository:
    ```sh
    git clone git@github.com:axa-group/Parsr.git
    ```

2. Then, install the npm packages:
    ```sh
    cd Parsr
    npm install
    ```

3. Launch Parsr's GUI tool:

    Under **MacOS** and **Linux**:

    ```sh
    npm run start:web:vue
    ```
    Under **Windows**:

    In one terminal:

    ```sh
    npm run start:api
    ```

    In another terminal:

    ```sh
    cd demo/vue-viewer && npm install && npm run serve
    ```

    Then, access [http://localhost:8080](http://localhost:8080).

Refer to the [Configuration documentation](docs/configuration.md) to interpret the configurable options in the viewer.

[API based usage](docs/usage.md#123-command-line-usage) and [command line usage](docs/usage.md#13-api) are documented in the [advanced usage](docs/usage.md) guide.

## Documentation

All documentation can be found [here](docs/README.md).


## Contribute

Please refer to the [contribution guidelines](CONTRIBUTING.md).

## Third Party Licenses

Third Party Libraries licenses for its [dependencies](docs/dependencies.md):

1. **QPDF**: Apache [http://qpdf.sourceforge.net](http://qpdf.sourceforge.net/)
2. **GraphicsMagick**: MIT [http://www.graphicsmagick.org/index.html](http://www.graphicsmagick.org/index.html)
3. **ImageMagick**: Apache 2.0 [https://imagemagick.org/script/license.php](https://imagemagick.org/script/license.php)
4. **Pdfminer.six**: MIT [https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE](https://github.com/pdfminer/pfminer.six/blob/master/LICENSE)
5. **Tesseract**: Apache 2.0 [https://github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)
6. **Camelot**: MIT [https://github.com/camelot-dev/camelot](https://github.com/camelot-dev/camelot)
7. **MuPDF** (Optional dependency): AGPL [https://mupdf.com/license.html](https://mupdf.com/license.html)
8. **Pandoc** (Optional dependency): GPL [https://github.com/jgm/pandoc](https://github.com/jgm/pandoc)

## License

Copyright 2019 AXA Group Operations S.A.  
Licensed under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license (see the [LICENSE](LICENSE) file).
