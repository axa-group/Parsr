var shell = require('shelljs');

if (!shell.test('-d', './dist/assets')) {
  shell.mkdir('./dist/assets');
}
shell.cp('-u', './server/assets/*.py', './dist/assets/');
shell.cp('-u', './server/assets/pdf.worker.js', './node_modules/pdfjs-dist/build/');
