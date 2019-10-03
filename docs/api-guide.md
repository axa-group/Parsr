# API Guide

This page is a guide on how to use the API.

- [API Guide](#API-Guide)
	- [0. Introduction](#0-Introduction)
	- [1. Send Your Document: POST /document](#1-Send-Your-Document-POST-document)
		- [`curl` command](#curl-command)
		- [Status: 202 - Accepted](#Status-202---Accepted)
		- [Status: 415 - Unsupported Media Type](#Status-415---Unsupported-Media-Type)
	- [2. Get the queue status: GET /queue/{id}](#2-Get-the-queue-status-GET-queueid)
		- [`curl` command](#curl-command-1)
		- [Status: 200 - OK](#Status-200---OK)
		- [Status: 201 - Created](#Status-201---Created)
		- [Status: 404 - Not Found](#Status-404---Not-Found)
		- [Status: 500 - Internal Server Error](#Status-500---Internal-Server-Error)
	- [3. Get the results](#3-Get-the-results)
		- [3.1. JSON, Markdown and Text results](#31-JSON-Markdown-and-Text-results)
			- [`curl` command](#curl-command-2)
			- [Status: 200 - OK](#Status-200---OK-1)
			- [Status: 404 - Not Found](#Status-404---Not-Found-1)
		- [3.2. CSV List of Files: GET /csv/{id}](#32-CSV-List-of-Files-GET-csvid)
			- [`curl` command](#curl-command-3)
			- [Status: 200 - OK](#Status-200---OK-2)
			- [Status: 404 - Not Found](#Status-404---Not-Found-2)
		- [3.3. CSV File: GET /csv/{id}/{page}/{table}](#33-CSV-File-GET-csvidpagetable)
			- [`curl` command](#curl-command-4)
			- [Status: 200 - OK](#Status-200---OK-3)
			- [Status: 404 - Not Found](#Status-404---Not-Found-3)

## 0. Introduction

First of all there is a few things to know:

- **The API is RESTful:** The API is over HTTP and follow REST standards.
- **The API is asynchronous:** There is a simple queue system and every job is managed by the API server.

The API has an endpoint prefix `/api` and then, optionaly, the version number `/v1.0`. That mean every request must be send to:

- `/api/v1.0`: will use the API version 1.0
- `/api/v1`: will use the latest API version 1.x
- `/api`: will use the latest API version

## 1. Send Your Document: [POST /document](https://axatechlab.github.io/Parsr/docs/api.html#api-Input-postDocument)

First of all, you need to do a POST request to send the document to Parsr. Along that, you need to send the configuration to tell Parsr what kind of processing it must perform on the file.

**Regarding the configuration file, please refer to the [configuration file documentation](configuration-file.md).**

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

## 2. Get the queue status: [GET /queue/{id}](https://axatechlab.github.io/Parsr/docs/api.html#api-Processing-getQueueStatus)

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

This error means that something went terribly wrong on the backend, probably an error comming Parsr.

## 3. Get the results

You can have results in different formats:
- JSON: [GET /json/{id}](https://axatechlab.github.io/Parsr/docs/api.html#api-Output-getJson)
- Markdown [GET /markdown/{id}](https://axatechlab.github.io/Parsr/docs/api.html#api-Output-getMarkdown)
- Raw text [GET /text/{id}](https://axatechlab.github.io/Parsr/docs/api.html#api-Output-getText)
- CSV [GET /csv/{id}](https://axatechlab.github.io/Parsr/docs/api.html#api-Output-getCsvList)

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

This error means that the result file doesn't exist. Maybe it wasn't asked to be outputed in the config you sent in the first request.

### 3.2. CSV List of Files: [GET /csv/{id}](https://axatechlab.github.io/Parsr/docs/api.html#api-Output-getCsvList)

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
  "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d/3/1",
]
```

#### Status: 404 - Not Found

This error means that the result file doesn't exist. Maybe it wasn't asked to be outputed in the config you sent in the first request.

### 3.3. CSV File: [GET /csv/{id}/{page}/{table}](https://axatechlab.github.io/Parsr/docs/api.html#api-Output-getCsv)

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

This error means that the result file doesn't exist. Maybe `{page}` and `{table}` parameters doesn't refer to an or it wasn't asked to be outputed in the config you sent in the first request.
