var shell = require('shelljs');

if (!shell.test('-d', './dist/assets') || !shell.test('-d', './dist/bin')) {
  shell.mkdir('./dist', './dist/assets', './dist/bin');
}
shell.cp('-u', './server/assets/*.py', './dist/assets/');
shell.cp('-u', './server/assets/pdf.worker.js', './node_modules/pdfjs-dist/build/');
shell.cp('-u', './server/defaultConfig.json', './dist/bin/');
