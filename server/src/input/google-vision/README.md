# Google Vision Input Module

Extractor module for OCR'ing image files.

### Credentials

To use the Google Vision input module, follow these steps:

1. [Create a new Google Cloud Platform App](https://console.cloud.google.com/projectcreate)
2. [Activate the Google Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com)
3. [Create new credentials](https://console.cloud.google.com/apis/credentials/wizard) and download the JSON file containing your credentials.
4. Copy the contents of the downloaded JSON file and paste everything as `"credentials"` value:
    ```json
    "extractor": {
      "pdf": "...",
      "ocr": "google-vision",
      "credentials": {
        "type": "...",
        "project_id": "...",
        "private_key_id": "...",
        "private_key": "...",
        "client_email": "...",
        "client_id": "...",
        "auth_uri": "...",
        "token_uri": "...",
        "auth_provider_x509_cert_url": "...",
        "client_x509_cert_url": "..."
      }
    },
    ```
5. Change your configuration to use `google-vision` for OCR.

_NB: This module only works with images yet. To make it work with PDF and TIFF, we'll need to use Batch File Annotation and Google Cloud Storage. [See the official guide](https://cloud.google.com/vision/docs/file-batch)._
