# Parsr Usage Guide

- [Parsr Usage Guide](#parsr-usage-guide)
  - [1. Install npm packages](#1-install-npm-packages)
  - [2. Install python packages](#2-install-python-packages)
  - [3. Run](#3-run)
    - [3.1. Configuration](#31-configuration)
    - [3.2. Demo: Web Viewer](#32-demo-web-viewer)
      - [3.2.1. Under Linux/MacOS:](#321-under-linuxmacos)
      - [3.2.2. Under Windows:](#322-under-windows)
    - [3.3. Command Line Usage](#33-command-line-usage)
  - [4. API](#4-api)
  - [5. Test](#5-test)

You can use Parsr in different ways:

- Using the command line
- Using the API
- Using the demo web viewer

## 1. Install npm packages

Inside the Parsr folder (where it has been installed), launch:

```sh
npm install
```

## 2. Install python packages

Inside the Parsr folder (where it has been installed), launch:

```sh
pipenv install
```

## 3. Run

### 3.1. Configuration

The tool contains a pipeline of modules that process the document step by step and is highly configurable. To change it's default configuration, please refer to the [configuration file documentation](configuration.md).

### 3.2. Demo: Web Viewer

To start the web viewer demo, simply run:

#### 3.2.1. Under Linux/MacOS:

```sh
npm run start:web:vue
```

#### 3.2.2. Under Windows:

In two different terminals, first:

```sh
npm run start:api
```

then in the other one:

```sh
cd demo/vue-viewer && npm install && npm run serve
```

Open [localhost:8080](http://localhost:8080) with your favorite browser to use the GUI.

### 3.3. Command Line Usage

Under Mac OS X, Linux:

```sh
npm run run:debug -- --input-file samples/t1.pdf --output-folder dist/ --document-name example --config server/defaultConfig.json --pretty-logs
```

Under Windows:

```sh
cmd /C "npm run run:debug -- --input-file samples/t1.pdf --output-folder samples --document-name example --config server/defaultConfig.json --pretty-logs"
```

## 4. API

Install the API server with:

```sh
npm run install:api
```

And then start the API server with:

```sh
npm run start:api
```

You can then call endpoints on [localhost:3001](http://localhost:3001).

The documentation for the API can be found [here](api-guide.md).

## 5. Test

```sh
npm run test
```
