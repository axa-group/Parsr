# ABBYY FineReader Server Input Module

The ABBYY FineReader is a high-precision OCR option provided to the users of the Parsr platform.

### Credentials

When ABBYY FineReader Server is chosen as the working OCR extraction solution, the following credentials need to be set on the host running Parsr:

1. `ABBYY_SERVER_URL` : The network address of the ABBYY FineReader Server.
2. `ABBYY_SERVER_VER` : The major version number of the ABBYY FineReader Server. For example: 14 for ABBYY FineReader Server 14.01.
3. `ABBYY_WORKFLOW` : The name of the server 's workflow to be called to process the file.

  ```json
  "extractor": {
    "pdf": "abbyy",
    "ocr": "abbyy",
    "credentials": {
      "ABBYY_SERVER_URL": "...",
      "ABBYY_SERVER_VER": "...",
      "ABBYY_WORKFLOW": "..."
    }
  },
  ```

### Essential Server Configuration

On the side of the ABBYY FineReader Server, make sure the XML output is configured for the selected workflow:

1. Double click on the workflow to be used.
2. In the tab titled 'output', make sure the list of file formats exported contains the XML format if not, add it with the 'New' button.
3. Make sure the following settings are enabled on the XML format 's settings:
   1. Character Attributes
   2. Extended Character Attributes
   3. Coordinates of the Original Image
   4. Character Formatting
