# API Guide

This page is a guide on how to use the API.

- [API Guide](#api-guide)
	- [0. Introduction](#0-introduction)
	- [1. Send Your Document: POST /document](#1-send-your-document-post-document)
		- [`curl` command](#curl-command)
		- [Status: 202 - Accepted](#status-202---accepted)
		- [Status: 415 - Unsupported Media Type](#status-415---unsupported-media-type)
	- [2. Get the queue status: GET /queue/{id}](#2-get-the-queue-status-get-queueid)
		- [`curl` command](#curl-command-1)
		- [Status: 200 - OK](#status-200---ok)
		- [Status: 201 - Created](#status-201---created)
		- [Status: 404 - Not Found](#status-404---not-found)
		- [Status: 500 - Internal Server Error](#status-500---internal-server-error)
	- [3. Get the results](#3-get-the-results)
		- [3.1. JSON, Markdown and Text results](#31-json-markdown-and-text-results)
			- [`curl` command](#curl-command-2)
			- [Status: 200 - OK](#status-200---ok-1)
			- [Status: 404 - Not Found](#status-404---not-found-1)
		- [3.2. CSV List of Files: GET /csv/{id}](#32-csv-list-of-files-get-csvid)
			- [`curl` command](#curl-command-3)
			- [Status: 200 - OK](#status-200---ok-2)
			- [Status: 404 - Not Found](#status-404---not-found-2)
		- [3.3. CSV File: GET /csv/{id}/{page}/{table}](#33-csv-file-get-csvidpagetable)
			- [`curl` command](#curl-command-4)
			- [Status: 200 - OK](#status-200---ok-3)
			- [Status: 404 - Not Found](#status-404---not-found-3)
		- [3.4. Download Results](#34-download-results)
	- [4. Server Configuration Access](#4-server-configuration-access)

## 0. Introduction

First of all there is a few things to know:

- **The API is RESTful:** The API is over HTTP and follow REST standards.
- **The API is asynchronous:** There is a simple queue system and every job is managed by the API server.

The API has an endpoint prefix `/api` and then, optionally, the version number `/v1.0`. That mean every request must be send to:

- `/api/v1.0`: will use the API version 1.0
- `/api/v1`: will use the latest API version 1.x
- `/api`: will use the latest API version

## 1. Send Your Document: `POST /document`

First of all, you need to do a POST request to send the document to Parsr. Along that, you need to send the configuration to tell Parsr what kind of processing it must perform on the file.

**Regarding the configuration file, please refer to the [configuration file documentation](configuration.md).** (**Tip**: You can also obtain the default configuration on the server via the endpoint: `/api/v1/default-config`. See [Section 4](#4-server-configuration-access).)

### `curl` command

```sh
curl -X POST \
  http://localhost:3001/api/v1/document \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/file.pdf;type=application/pdf' \
  -F 'config=@/path/to/config.json;type=application/json'
```

### Status: 202 - Accepted

```
00cafe4463b9c12aac145b3ee8f00d
```

The document you sent has been accepted and is being processed. The body contains the unique **queue ID**. You need to keep it somewhere for later, to know what's the queue status and get the results.

### Status: 415 - Unsupported Media Type

This error means the file format you sent is not supported by the platform (it's probably not a PDF or an Image).

## 2. Get the queue status: `GET /queue/{id}`

This request allows you to get the status of the queued document being processed. You need to give it the **queue ID** that was return in the previous request.

### `curl` command

```sh
curl -X GET \
  http://localhost:3001/api/v1/queue/00cafe4463b9c12aac145b3ee8f00d
```

### Status: 200 - OK

```json
{
  "estimated-remaining-time": 30,
  "progress-percentage": 10,
  "start-date": "2018-12-31T12:34:56.789Z",
  "status": "Detecting reading order..."
}
```

This status means the document is still being processed.

The `estimated-remaining-time` is expressed in seconds.

_**NB:** `estimated-remaining-time` and `progress-percentage` are not working yet and are here and are placeholder for future usage._

### Status: 201 - Created

```json
{
  "id": "00cafe4463b9c12aac145b3ee8f00d",
  "json": "/api/v1/json/00cafe4463b9c12aac145b3ee8f00d",
  "csv": "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d",
  "text": "/api/v1/text/00cafe4463b9c12aac145b3ee8f00d",
  "markdown": "/api/v1/markdown/00cafe4463b9c12aac145b3ee8f00d"
}
```

This status is sent when the processing is done. It returns links to the generated resources and the ID of the document for convenience.

### Status: 404 - Not Found

This error means the queue ID doesn't refer to any known processing queue.

### Status: 500 - Internal Server Error

This error means that something went terribly wrong on the backend, probably an error coming from Parsr.

## 3. Get the results

You can have results in different formats:

- JSON: `GET /json/{id}`
- Markdown: `GET /markdown/{id}`
- Raw text: `GET /text/{id}`
- CSV: `GET /csv/{id}`

These requests allow you to get the results of the processed document. You need to give it the **queue ID** that was return in a previous request.

### 3.1. JSON, Markdown and Text results

The queries for JSON, Markdown and raw text are all working in the same way. CSV is a bit different and is described in the next section.

#### `curl` command

```sh
curl -X GET \
  http://localhost:3001/api/v1/json/00cafe4463b9c12aac145b3ee8f00d
```

#### Status: 200 - OK

```js
{
	"metadata": [/* ... */],
	"fonts": [/* ... */],
	"pages": [/* ... */],
}
```

For more information on the JSON format, please [refer to the specific guide](json-output.md).

#### Status: 404 - Not Found

This error means that the result file doesn't exist. Maybe it wasn't asked to be outputted in the config you sent in the first request.

### 3.2. CSV List of Files: `GET /csv/{id}`

Since you can have multiple tables per page, you need to query them in two steps:

First of all, get the list of every CSV files' paths:

#### `curl` command

```sh
curl -X GET \
  http://localhost:3001/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d
```

#### Status: 200 - OK

```json
[
  "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d/1/1",
  "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d/2/1",
  "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d/2/2",
  "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d/3/1"
]
```

#### Status: 404 - Not Found

This error means that the result file doesn't exist. Maybe it wasn't asked to be outputted in the config you sent in the first request.

### 3.3. CSV File: `GET /csv/{id}/{page}/{table}`

Then, we can get the CSV files one by one with the following parameters:

- `{id}` is the ID of the document
- `{page}` is the page number
- `{table}` is the table number

#### `curl` command

```sh
curl -X GET \
  http://localhost:3001/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d/1/1
```

#### Status: 200 - OK

```csv
3x4 table;Empty column;Numbers
;;
Item A;;3.14
"Item B
on two lines";;1,234.56
```

This CSV output example contains multiline cells and an empty column.

#### Status: 404 - Not Found

This error means that the result file doesn't exist. Maybe `{page}` and `{table}` parameters doesn't refer to an or it wasn't asked to be outputted in the config you sent in the first request.

### 3.4. Download Results

You can download any of the available output formats:
- JSON: `GET /json/{id}?download=1`
- Markdown: `GET /markdown/{id}?download=1`
- Raw text: `GET /text/{id}?download=1`
- CSV: `GET /csv/{id}?download=1`

Being `{id}` the same **queue ID** obtained in [Section 3 - Get the results](#3-get-the-results).

For JSON and Raw Text, a `json` or `txt` file will start downloading.
For Markdown, if the document has any embedded assets like images, a `zip` file will start downloading, including the markdown and a folder with all required assets. If it does not contain any images, a single `md` file will be downloaded.
For CSV option, a `zip` will be downloaded, containing one `csv` file per each table in the document.

## 4. Server Configuration Access

The API can also be queried to gain access to the following server assets:

1.  **Default Configuration**: The server's default configuration can be queried (at `/api/v1/default-config`) using:

        curl -X GET \
        http://localhost:3001/api/v1/default-config

2.  **List of Modules**: The list of all usable modules can be queried from the server (at `/api/v1/modules`) using:

        curl -X GET \
        http://localhost:3001/api/v1/modules

3.  **Module Configuration**: A module's configuration file, which includes name, description and each module parameter's default value and range can be queried (at `/api/v1/module-config/<module_name>`) using:

        curl -X GET \
        http://localhost:3001/api/v1/module-config/table-detection

... which will fetch the configuration file for the table-detection module.
