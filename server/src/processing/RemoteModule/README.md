# Remote Module

## Purpose

This module is a bit different than others, because it doesn't change the document by itself.

It exports the document as [JSON](../../../../docs/json-output.md), call an API with it and expect a modified JSON back.

## How to use it

First of all, you need to have a small web server that will handle the API call.
You can use our [Python example](../../../../demo/python-module/README.md) as a start.

Your server needs to handle a HTTP `POST` request on the given URL, respond with the modified JSON.

## Dependencies

None
