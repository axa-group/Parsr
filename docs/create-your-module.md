# Create your Module

Creating a custom module can be very useful to add some treament on the document.

You have two way to do it:

1) Use the [Remote Module](modules/remote-module.md) that will send the JSON by HTTP and expect the modified JSON as an answer
2) Create a Typescript Module and add it to the pipeline

## 1. Create a New Typescript Module

Create a new file in `/server/src/modules/` and name it accordingly.

You can copy the [template module file](../server/src/modules/TemplateModule.ts) to help you having a boilerplate. It also contains some handy comments.

## 2. Add to Register

To add your newly created module to the register, simply open the [Cleaner file](../server/src/Cleaner.ts) `/server/src/Cleaner.ts` and add your module class to the `Cleaner.cleaningToolRegister` attribute.

## 3. Add it to the Configuration

If you want your module to run you need to enable it in your [configuration](configuration-file.md#3-Cleaner-Config).

Simply add a line in the `cleaner` array with the name of your module, and potential options.

## 4. Run it!

That's it! Your new awesome module should run and modify the document according to your needs!
