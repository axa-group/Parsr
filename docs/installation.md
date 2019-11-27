# Parsr Installation Guide

- [Parsr Installation Guide](#parsr-installation-guide)
  - [1. Docker Installation](#1-docker-installation)
  - [2. Bare-Metal Installation](#2-bare-metal-installation)
    - [2.1. Installing Dependencies under Linux](#21-installing-dependencies-under-linux)
    - [2.2. Installing Dependencies under MacOS](#22-installing-dependencies-under-macos)
    - [2.3. Installing Dependencies under Windows](#23-installing-dependencies-under-windows)
      - [2.3.1. Tesseract](#231-tesseract)
  - [3. Optional Dependencies](#3-optional-dependencies)
    - [3.1. MuPDF](#31-mupdf)
    - [3.2. Pandoc](#32-pandoc)
    - [3.3. ABBYY FineReader](#33-abbyy-finereader)

This document will guide you through the installation process.

You can install Parsr either using Docker containers, or directly on your machine. You don't need to do both!

## 1. Docker Installation

Containers are already available on [Docker Hub](https://hub.docker.com/u/axarev).

The documentation to build and run Docker containers is [here](docker.md).

## 2. Bare-Metal Installation

### 2.1. Installing Dependencies under Linux

Under a **Debian** based distribution:

```sh
sudo add-apt-repository ppa:ubuntuhandbook1/apps
sudo apt-get update
sudo apt-get install nodejs npm qpdf imagemagick graphicsmagick tesseract-ocr libtesseract-dev python3-tk ghostscript python3-pip
pip install camelot-py
pip install numpy pillow scikit-image
pip install pdfminer.six
```

Under **Arch** Linux :

```sh
pacman -S nodejs npm qpdf imagemagick graphicsmagick pdfminer tesseract python-pip
pip install camelot-py
pip install numpy pillow scikit-image
```

### 2.2. Installing Dependencies under MacOS

The package manager we suggest using under MacOS is [homebrew](https://brew.sh/).
To install it, launch the following in a terminal

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Next, install the required dependencies:

```sh
brew install node qpdf imagemagick graphicsmagick tesseract tesseract-lang tcl-tk ghostscript
```

To install the python based dependencies (pdfminer and camelot), install, first install `pip`:

```sh
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

and then the dependencies:

```sh
pip install pdfminer.six
pip install camelot-py
pip install numpy pillow scikit-image
```

### 2.3. Installing Dependencies under Windows

The installation procedure for Parsr requires the command `where.exe` to be in the path.  
Try typing `where` in the command prompt. If the command cannot be found, execute the following to add its location to PATH:

```sh
setx PATH "\$env:PATH;C:\Windows\System32" -m
```

Then,

1. We recommend using [Chocolatey](https://chocolatey.org) as the package manager for installing dependencies under Windows. To install Chocolatey, [follow these instructions](https://chocolatey.org/install#installing-chocolatey).
2. [Download and install **`node.js`**](https://nodejs.org/en/download)
3. For the **pdfminer** extractor for pdfs, [follow these steps](https://github.com/pdfminer/pdfminer.six#how-to-install).
4. Install **`qpdf`** and **`imagemagick`** using Powershell (Run as Administrator):

   ```sh
   choco install qpdf imagemagick
   ```

5. Install [**graphicsmagick**](http://www.graphicsmagick.org/).

6. For table detection, install [**camelot**](https://camelot-py.readthedocs.io/en/master/user/install-deps.html#for-windows).

#### 2.3.1. Tesseract

You can download Tesseract 4.0 64-bit for Windows or check out other available formats on [the wiki](https://github.com/UB-Mannheim/tesseract/wiki).

Then, you need to add tesseract.exe to your PATH:
If you have install it in `C:\Program Files (x86)\Tesseract-OCR`, you can either add it [using the user interface](https://docs.alfresco.com/4.2/tasks/fot-addpath.html) execute the following command in Powershell (Run as Administrator):

```sh
setx PATH "\$env:PATH;C:\Program Files (x86)\Tesseract-OCR" -m
```

## 3. Optional Dependencies

The following dependencies are **completely optional**, and their exclusion does not hinder the proper functioning of the Parsr pipeline.

The functions of each, as well as the installation process are are explained below:

### 3.1. MuPDF

MuPDF, in the Parsr platform is Used to fix certain error-prone or corrupt PDF files on input.

To install MuPDF, follow the steps corresponding to your environment:

- Under a **Debian** based distribution:

  ```sh
  sudo apt-get install mupdf mupdf-tools
  ```

- Under **Arch** Linux:

  ```sh
  pacman -S mupdf-tools
  ```

- Under MacOS:

  ```sh
  brew install mupdf-tools
  ```

- Under Windows:

  ```sh
  choco install mupdf
  ```

If MuPDF is not installed, a corrupt/unreadable PDF file at input will be left untreated.
A message of such an occurrence will be logged.

### 3.2. Pandoc

Pandoc is a document format conversion program, used under Parsr to generate PDF files from an intermediate Markdown output after the cleaning operation in the pipeline.

To install Pandoc, follow the steps corresponding to your environment:

- Under a **Debian** based distribution:

  ```sh
  sudo apt-get install pandoc
  ```

- Under **Arch** Linux:

  ```sh
  pacman -S pandoc
  ```

- Under MacOS:

  ```sh
  brew install pandoc
  ```

- Under Windows:

  ```sh
  choco install pandoc
  ```

If Pandoc is not installed, the user will not be able to generate PDF files on output.
Any configuration requiring a PDF file output will be ignored.

### 3.3. ABBYY FineReader

ABBYY FineReader is a proprietary high precision OCR solution for generating rich text from images.
One can obtain the ABBYY FineReader Server from [here](https://www.abbyy.com/en-us/finereader-server/).

ABBYY FineReader is an **optional dependency**, and it's absence should in no way hinder the everyday usage of Parsr's default OCR solution, tesseract.
