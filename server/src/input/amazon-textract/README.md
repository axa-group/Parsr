# Amazon Textract Input Module

Extractor module for OCR'ing image files.

### Credentials

To use the Amazon Textract input module, you need a valid set of access keys from AWS with "_AmazonTextractFullAccess_"
You can generate one for free following [this guide](https://docs.aws.amazon.com/textract/latest/dg/getting-started.html).

Once you have the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, make sure to set those in the `"credentials"` key in the config file.

  ```json
  "extractor": {
    "pdf": "...",
    "ocr": "amazon-textract",
    "credentials": {
      "AWS_ACCESS_KEY_ID": "...",
      "AWS_SECRET_ACCESS_KEY": "..."
    }
  },
  ```
