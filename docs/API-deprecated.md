# API - DEPRECATED

### :warning: This API is now deprecated. Please refer to the new version: [api-guide.md](api-guide.md). :warning:

The version of this API is 0.3.

## Upload a file

To upload a file, simply do an HTTP request of the following format:

```http
URL: /upload
Method: POST
Form Data:
    file: Document File
    config: Json config
```

_The JSON config format is described below._

In the end, the full request may look like this:

```http
POST /upload HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=MultipartBoundary

--MultipartBoundary
Content-Disposition: form-data; name="config"
Content-Type: application/json

{
    "version": 0.1,
    "extractor": {
        "fast-extractor": false,
        "extract-tables": true
    },
    "cleaner": [
        "fontMerge",
        "removeOutOfPage",
        "removeWhitespace", { "minWidth": 30 },
        "titleDetection",
        "linkDetection",
        "flagTableElements",
        "textOrderDetection",
        "lineMerge", { "maximumSpaceBetweenWords": 2, "mergeTableElements": true },
        "lineMerge", { "maximumSpaceBetweenWords": 10 },
        "redundancyDetection",
        "removeWhitespace",
        "paragraphMerge",
        "paragraphLastLine"
    ]
}
--MultipartBoundary--
Content-Disposition: form-data; name="file"; filename="example.pdf"
Content-Type: application/pdf

<pdf_content>
--MultipartBoundary
```

## Response

The response will be of the following format:

```json
{
  "filename": "example.json"
}
```

## Get the JSON result

Query:

```http
URL: /json/example.json
Method: GET
```

## Response

The response will be a JSON representing the document. Its format is derived from a [PdfFile.ts](https://github.com/AXATechLab/Parsr/blob/master/scripts/extractor/types/PdfFile.ts).

It basically looks like this:

```js
{
    "pages": [{
        "top": 0,
        "left": 0,
        "number": 1,
        "pages": 28,
        "height": 842,
        "width": 595,
        "tables": [...],
        "paths": [...],
        "text": [...]
    }],
    "fontCatalog": [...]
}
```
