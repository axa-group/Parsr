//const dotenv = require('dotenv');
//dotenv.config({ path: require('find-config')('.env') });

const path = require('path');
const fs = require('fs');
const outDirPath = `${__dirname}/tmp`;


const extractAndCorrectFontsFromPDF = require('./src/extractAndCorrectFontsFromPDF.js');

let filePath = (process.argv.length > 2) ? process.argv[2] : `${__dirname}/testPDF/test.pdf`;

const { Command } = require('commander');
const program = new Command();

program
  .name('parsr-fix-pdf-font')
  .description('CLI to fix PDF fonts')
  .version('0.0.1')
  .option('--input <pdf-input-file-path>')
  .option('--output <pdf-output-file-path>')
  .option('--lang <language-code>')
  .parse();

const options = program.opts();
  
if (!options.input) {
  console.error('--input is Required');
  return;
}

if (!options.output) {
  console.error('--output is Required');
  return;
}


async function main(input, output, lang='eng') {  
  if (!fs.existsSync(outDirPath)) {
    fs.mkdirSync(outDirPath);
  }

  await extractAndCorrectFontsFromPDF(input, output, lang, outDirPath);

  return;

}

main(options.input, options.output, options.lang);