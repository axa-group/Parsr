[![Build Status](https://cloud.drone.io/api/badges/axa-group/Parsr/status.svg)](https://cloud.drone.io/axa-group/Parsr)

# Parsr: 从文档到数据，一步到位!

**Parsr** 是一个小巧实用的文档（图像，pdf）清理，解析和提取的工具，可为数据科学家和开发者生成随时可用且整理完成的数据。

它为用户提供了结构化且标记完全的信息集，适用于包括数据输入和文档分析自动化，存档等即用型应用程序。

- [Parsr: 从文档到数据，一步到位!](#parsr-turn-your-documents-into-data)
  - [1. 开始 / 安装](#1-getting-started--installation)
    - [1.1. Docker 安装](#11-docker-installation)
    - [1.2.基础依赖安装](#12-bare-metal-installation)
      - [1.2.1. 安装 Linux 环境下的依赖](#121-installing-dependencies-under-linux)
      - [1.2.2. 安装 MacOS 环境下的依赖](#122-installing-dependencies-under-macos)
      - [1.2.3. 安装 Windows 环境下的依赖](#123-installing-dependencies-under-windows)
        - [1.2.3.1. Tesseract](#1232-tesseract)
    - [1.3. 可选依赖](#13-optional-dependencies)
      - [1.3.1. MuPDF](#131-mupdf)
      - [1.3.2. Pandoc](#132-pandoc)
      - [1.3.3. ABBYY FineReader](#133-abbyy-finereader)
  - [2. 使用说明](#2-usage)
    - [2.1. 安装 npm 包](#21-install-npm-packages)
    - [2.2. 运行](#22-run)
      - [2.2.1. 配置](#221-configuration)
      - [2.2.2. 演示: Web Viewer](#222-demo-web-viewer)
      - [2.2.3. 命令行的使用](#223-command-line-usage)
    - [2.3. API](#23-api)
    - [2.4. 测试](#24-test)
  - [3. ABBYY FineReader 服务器](#3-abbyy-finereader-server)
    - [3.1. 服务器配置](#31-server-configuration)
  - [4. 依赖说明](#4-dependencies-explanation)
    - [4.1. 基础依赖](#41-base-dependencies)
    - [4.2. 提取模块的依赖](#42-extraction-dependencies)
    - [4.3. 可选依赖](#43-optional-dependencies)
  - [5. 贡献](#5-contribute)
  - [6. 第三方证书](#6-third-party-licenses)
  - [7. 证书](#7-license)

## 1. 开始 / 安装

这一节会带您快速安装 Parsr。

您可以使用 Docker 或者直接在您的机器上安装。

1.1 或 1.2 两者择其一即可。

### 1.1. 通过 Docker 安装

Docker 容器已经上传到 [Docker Hub](https://hub.docker.com/u/axarev).

其搭建方法和使用说明在 [这里](docs/docker.md).

### 1.2. 直接安装

#### 1.2.1. 安装 Linux 环境下的依赖

在 **Debian** 操作系统下:

```sh
sudo add-apt-repository ppa:ubuntuhandbook1/apps
sudo apt-get update
sudo apt-get install nodejs npm qpdf imagemagick tesseract-ocr libtesseract-dev
```

在 **Arch** 操作系统下 :

```sh
pacman -S nodejs npm qpdf imagemagick tesseract
```

#### 1.2.2. 安装 MacOS 环境下的依赖

我们推荐使用 [homebrew](https://brew.sh/)作为 MacOS 的软件包管理工具
使用如下指令来安装：

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

之后用 brew 指令安装依赖：

```sh
brew install node qpdf imagemagick graphicsmagick tesseract tesseract-lang
```

#### 1.2.3. 安装 Windows 环境下的依赖

1. Windows 下，我们推荐使用 [Chocolatey](https://chocolatey.org) 作为软件包管理工具来安装依赖： [Chocolatey 安装方法](https://chocolatey.org/install#installing-chocolatey)

2. 以管理员身份运行 Powershell，安装 **`qpdf`** 和 **`imagemagick`** :

   ```sh
   choco install qpdf imagemagick
   ```

3. [下载安装 **`node.js`**](https://nodejs.org/en/download)

##### 1.2.3.1. Tesseract

您可以在 [the wiki](https://github.com/UB-Mannheim/tesseract/wiki) 下载 Tesseract 4.0 64-bit for Windows 或者查看更新

之后需要将 tesseract.exe 添加到系统路径 PATH：

如果已经将其安装到 `C:\Program Files (x86)\Tesseract-OCR`，您可以通过 [用户界面](https://docs.alfresco.com/4.2/tasks/fot-addpath.html) 进行路径添加，或者在 Powershell 中使用如下指令(以管理员身份运行):

```sh
setx PATH "\$env:PATH;C:\Program Files (x86)\Tesseract-OCR" -m
```

### 1.3. 可选依赖

以下依赖项是**可选的**，不安装它们不会影响 Parsr 的正常运行。

每个依赖的功能以及安装过程如下所述：

#### 1.3.1. MuPDF

MuPDF 在 Parsr 中被用于修复输入中某些容易出错或损坏的 PDF 文件。

要安装 MuPDF，请按照与您的环境相对应的步骤操作：

- 在 **Debian** 操作系统下:

  ```sh
  sudo apt-get install mupdf mupdf-tools
  ```

- 在 **Arch** 操作系统下 :

  ```sh
  pacman -S mupdf-tools
  ```

- 在 **MacOS** 下 :

  ```sh
  brew install mupdf-tools
  ```

- 在 **Windows** 下 :

  ```sh
  choco install mupdf
  ```

如果未安装 MuPDF，则在输入中损坏/不可读的 PDF 文件将不予处理。

日志将会记录此消息。

#### 1.3.2. Pandoc

Pandoc 是一种文档格式转换程序，在 Parsr 中被用于清理操作之后，从 Markdown 的输出生成 PDF 文件。

要安装 Pandoc，请按照与您的环境相对应的步骤操作：

- 在 **Debian** 系统下:

  ```sh
  sudo apt-get install pandoc
  ```

- 在 **Arch Linux** 系统下 :

  ```sh
  pacman -S pandoc
  ```

- 在 **MacOS** 下 :

  ```sh
  brew install pandoc
  ```

- 在 **Windows** 下 :

  ```sh
  choco install pandoc
  ```

如果未安装 Pandoc，则用户将无法在输出中生成 PDF 文件。

任何需要 PDF 文件输出的配置都将被忽略。

#### 1.3.3. ABBYY FineReader

ABBYY FineReader 是一种高精度 OCR 解决方案，用于从图像生成丰富的文本。
可以从[这里](https://www.abbyy.com/en-us/finereader-server/)获取 ABBYY FineReader Server。

ABBYY FineReader 是一个**可选的依赖**，不安装它不会影响 Parsr 的默认 OCR 解决方案（tesseract）的日常使用。

## 2. Usage

您可以通过不同方式使用 Parsr：

- 通过命令行
- 通过 API
- 通过 Web Viewer

### 2.1. 安排 npm 包

```sh
npm install
```

### 2.2. 运行

#### 2.2.1. 配置

该工具包含一系列模块，可逐步处理文档，并且具有高度可配置性。

要更改它的默认配置，请参阅 [配置文档](docs/configuration-file.md).

#### 2.2.2. 演示: Web Viewer

要启动 web 的演示, 运行:

```sh
npm run start:web
```

之后通过您喜欢的浏览器打开 [localhost:3000](http://localhost:3000)

#### 2.2.3. 命令行使用

Mac OS X, Linux 下:

```sh
npm run run:debug -- --input-file samples/t1.pdf --output-folder dist/ --document-name example --config server/defaultConfig.json --pretty-logs
```

Windows 下:

```sh
cmd /C "npm run run:debug -- --input-file samples/t1.pdf --output-folder samples --document-name example --config server/defaultConfig.json --pretty-logs"
```

### 2.3. API

安装 API 服务器:

```sh
npm run install:api
```

启动 API 服务器:

```sh
npm run start:api
```

之后调用端点： [localhost:3001](http://localhost:3001).

点击[这里](docs/api-guide.md)查看 API 的文档。

### 2.4. 测试

```sh
npm run test
```

## 3. ABBYY FineReader Server

ABBYY FineReader Server 为 Parsr 用户提供了高精度 OCR 选项。

Parsr 默认的 OCR 解决方案是 tesseract，这是 Parsr 的基本依赖。

所以它是完全可选的。

### 3.1. 服务器配置

选择 ABBYY FineReader Server 作为 OCR 提取解决方案时，需要在运行 Parsr 的主机上设置以下环境变量：

1. `ABBYY_SERVER_URL` : ABBYY FineReader Server 的网络地址
2. `ABBYY_SERVER_VER` : ABBYY FineReader Server 的版本号，例如：14 对应 ABBYY FineReader Server 14.01
3. `ABBYY_WORKFLOW` : 要调用来处理文件的服务器 workflow 名称

在 ABBYY FineReader 服务器端，确保对于所选 workflow 配置了 XML 的输出：

1.双击要使用的 workflow

2.在标题为“output”的选项卡中，确保导出的文件格式列表包含 XML 格式，如果没有，请使用“New”按钮添加。

3.确保在 XML 格式的设置上启用以下设置：

​ -字符属性（Character Attributes）
​ -扩展字符属性（Extended Character Attributes）
​ -原始图像的坐标（Coordinates of the Original Image）
​ -字符格式（Character Formatting）

## 4. 依赖说明

### 4.1. 基础依赖

需要安装以下*必须的* 依赖以使 Parsr 正常工作：

1. `node.js` : Parsr 平台的底层框架
2. `qpdf` : 打开有密码保护的 PDF
3. `imagemagick` : 用于格式转化

### 4.2. 提取模块的依赖

根据平台要处理的文档类型，应安装以下一个或多个依赖项。

如果要将包含数字（或可选定）文本元素的简单 PDF 输入系统，则需要安装**pdfminer **库。

如果图像（`jpg`，`png`，`tiff`等）要与工具一起使用，那么该工具还支持使用以下两个基于 OCR 的解决方案作为底层提取模块：

1. **`tesseract`** : 开源，且支持超过 100 种语言，Google 的 Tesseract 是一款免费的 OCR 解决方案。 但是不能检测到文本格式或表格数据。
2. **`ABBYY FineReader Server`** : 专业的 OCR 解决方案，具有极高的识别准确度，格式识别和表格数据提取。 它是一个可选的依赖项。

### 4.3. 可选依赖

以下依赖可以选择性的安装：

1. `mupdf-tools`: 用于纠正在输入时损坏的 PDF
2. `pandoc`: 用于清理操作之后，从 Markdown 的输出生成 PDF 文件。

## 5. 贡献

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md).

## 6. 第三方证书

第三方证书 :

1. **QPDF**: Apache [http://qpdf.sourceforge.net](http://qpdf.sourceforge.net/)
2. **ImageMagick**: Apache 2.0 [https://imagemagick.org/script/license.php](https://imagemagick.org/script/license.php)
3. **Tesseract**: Apache 2.0 [https://github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)
4. **Camelot**: MIT [https://github.com/camelot-dev/camelot](https://github.com/camelot-dev/camelot)
5. **MuPDF** (Optional dependency): AGPL [https://mupdf.com/license.html](https://mupdf.com/license.html)
6. **Pandoc** (Optional dependency): GPL [https://github.com/jgm/pandoc](https://github.com/jgm/pandoc)

## 7. 证书

Copyright (C) 2019 AXA. Licensed under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license (see the [LICENSE](LICENSE) file).
