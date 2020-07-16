# Parsr Installation Guide

- [Parsr Installation Guide](#parsr-installation-guide)
  - [1. Docker Installation](#1-docker-installation)
  - [2. Automatic Installation](#2-automatic-installation)
  - [3. Bare-Metal Installation](#3-bare-metal-installation)
    - [3.1. Installing Dependencies under Linux](#31-installing-dependencies-under-linux)
    - [3.2. Installing Dependencies under MacOS](#32-installing-dependencies-under-macos)
    - [3.3. Installing Dependencies under Windows](#33-installing-dependencies-under-windows)
  - [4. Optional Dependencies](#4-optional-dependencies)
    - [4.1. MuPDF](#41-mupdf)
    - [4.2. Pandoc](#42-pandoc)
    - [4.3. ABBYY FineReader](#43-abbyy-finereader)
  - [5. Node.js Dependencies](#5-nodejs-dependencies) 
  - [6. Checking Installation](#6-checking-installation) 

This document will guide you through the installation process.

You can install Parsr either using [Docker containers](#1-docker-installation), or directly on your machine with an [automatic script](#2-automatic-installation) or [manually](#3-bare-metal-installation). You don't need to do everything!

## 1. Docker Installation

Containers are already available on [Docker Hub](https://hub.docker.com/u/axarev).

The documentation to build and run Docker containers is [here](docker.md).

## 2. Automatic Installation

You can install Parsr locally via a Node.js script:

1. [Download and install **`node.js`**](https://nodejs.org/en/download)
2. In the root of Parsr directory, open a terminal and run `npm run install:pre`.
  This command will install every required and optional dependency.  

For Windows platforms, this script requires **TLS 1.2 or newer** enabled.

## 3. Bare-Metal Installation

*Note: Currently, table detection requires Python 3.7 and below, as a vital dependency, `camelot-py` has not been ported yet to Python 3.8.*

If the automatic install script is not available for your platform, you can always do a manual installation following this steps:

### 3.1. Installing Dependencies under Linux

Under a **Debian** based distribution:

```sh
sudo add-apt-repository ppa:ubuntuhandbook1/apps
sudo apt-get update
sudo apt-get install nodejs npm qpdf imagemagick tesseract-ocr libtesseract-dev python3-tk ghostscript python3-pip
pip install camelot-py[cv] numpy pillow scikit-image PyPDF2 pdfminer.six sklearn
```

Under **Arch** Linux:

```sh
pacman -S nodejs npm qpdf imagemagick python-pdfminer tesseract python-pip
pip install camelot-py[cv] numpy pillow scikit-image PyPDF2 pdfminer.six sklearn
```

Note: if camelot-py[cv] generates an error in console, you might want to try replacing it with camelot-py\\[cv\\].

### 3.2. Installing Dependencies under MacOS

The package manager we suggest using under MacOS is [homebrew](https://brew.sh/).
To install it, launch the following in a terminal

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

Next, install the required dependencies:

```sh
brew install node python qpdf imagemagick tesseract tesseract-lang tcl-tk ghostscript
```

Next, upgrade python:

```sh
brew upgrade python
```

To install the python3 based dependencies (pdfminer and camelot), install, first install `pip3`:

```sh
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
```

and then the dependencies:

```sh
pip3 install pdfminer.six
pip3 install camelot-py[cv]
pip3 install numpy pillow scikit-image
python2.7 -m pip install PyPDF2
```

To install the python2 based dependencies (pdfminer and camelot), install, first install `pip`:

```sh
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

and then the dependencies:

```sh
python2.7 -m pip install PyPDF2
```

### 3.3. Installing Dependencies under Windows

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

5. For table detection, install [**camelot**](https://camelot-py.readthedocs.io/en/master/user/install.html#install).

6. For **`tesseract`** you can download and install, or check out other available formats on [the wiki](https://github.com/UB-Mannheim/tesseract/wiki).
Then, you need to add tesseract.exe to your PATH:
If you have install it in `C:\Program Files (x86)\Tesseract-OCR`, you can either add it [using the user interface](https://docs.alfresco.com/4.2/tasks/fot-addpath.html) execute the following command in Powershell (Run as Administrator):
    ```sh
    setx PATH "\$env:PATH;C:\Program Files (x86)\Tesseract-OCR" -m
    ```
7. For PDF manipulation, install [PyPDF2](https://pypi.org/project/PyPDF2). *Note: If camelot is installed, PyPDF2 will be already available.*

## 4. Optional Dependencies

The following dependencies are **completely optional**, and their exclusion does not hinder the proper functioning of the Parsr pipeline.

The functions of each, as well as the installation process are are explained below:

### 4.1. MuPDF

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

### 4.2. Pandoc

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

### 4.3. ABBYY FineReader

ABBYY FineReader is a proprietary high precision OCR solution for generating rich text from images.
One can obtain the ABBYY FineReader Server from [here](https://www.abbyy.com/en-us/finereader-server/).

ABBYY FineReader is an **optional dependency**, and it's absence should in no way hinder the everyday usage of Parsr's default OCR solution, tesseract.

## 5. Node.js Dependencies

To install every Node dependency, just open a terminal at the root directory of Parsr and type:

```sh
npm install
```

## 6. Checking Installation

To verify that you have everything correctly installed, you can follow this steps:

- Run the test suite:
  ```sh
  npm run test
  ```

- Start the API:
  ```sh
  npm run start:api
  ```

- Open the following URL on your browser:
  
  http://127.0.0.1:3001/api/check-installation

  
If all test passed and every required dependency is found, then you're good to go!
