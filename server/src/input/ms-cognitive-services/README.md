# Microsoft Cognitive Services Input Module

Extractor module for OCR'ing image files.

### Credentials

To use the Microsoft Cognitive Services input module, you need a Microsoft Cognitive Services APIKEY.  
You can generate one for free following [this link](https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.CognitiveServices%2Faccounts).

Once you have the key, make sure to set it in the `"credentials"` key in the config file.

  ```json
  "extractor": {
    "pdf": "...",
    "ocr": "ms-cognitive-services",
    "credentials": {
      "OCP_APIM_SUBSCRIPTION_KEY": "...",
      "OCP_APIM_ENDPOINT": ""
    }
  },
  ```

Optionally, you can change the region endpoint to the one that you want to use, via the `OCP_APIM_ENDPOINT` value. If omitted, the default value will be `https://westeurope.api.cognitive.microsoft.com/`.

A list with all available endpoint regions can be found [here](https://westus.dev.cognitive.microsoft.com/docs/services/5adf991815e1060e6355ad44/operations/2afb498089f74080d7ef85eb).
