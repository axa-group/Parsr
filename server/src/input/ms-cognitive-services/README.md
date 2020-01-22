# Microsoft Cognitive Services Input Module

To use the Microsoft Cognitive Services input module, you need a Microsoft Cognitive Services APIKEY.  
You can generate one for free following [this link](https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.CognitiveServices%2Faccounts).

Once you have the key, make sure to set the environment variable `OCP_APIM_SUBSCRIPTION_KEY=<APIKEY>` before running Parsr.

Optionally, you can change the region endpoint to the one that you want to use, via the environment variable `OCP_APIM_ENDPOINT`. The default value is `https://westeurope.api.cognitive.microsoft.com/`.

A list with all available endpoint regions can be found [here](https://westus.dev.cognitive.microsoft.com/docs/services/5adf991815e1060e6355ad44/operations/2afb498089f74080d7ef85eb).

If you are using Microsoft Cognitive Services with Parsr GUI, input fields for the APIKEY and ENDPOINT will be available and required.
