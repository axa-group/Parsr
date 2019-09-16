# Google Vision Input Module

To use the Google Vision input module, follow these steps:

1. [Create a new Google Cloud Platform App](https://console.cloud.google.com/projectcreate)
2. [Activate the Google Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com)
3. [Create new credentials](https://console.cloud.google.com/apis/credentials/wizard) and download the JSON file containing your credentials.
4. Add the path to the credentials file to the environement variable `GOOGLE_APPLICATION_CREDENTIALS`: `export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/credentials.json`.
5. Change your configuration to use `google-vision` for images.

_NB: This module only works with images yet. To make it work with PDF and TIFF, we'll need to use Batch File Annotation an Google Cloud Storage. [See the official guide](https://cloud.google.com/vision/docs/file-batch)._
