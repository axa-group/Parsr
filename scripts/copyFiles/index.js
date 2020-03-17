var shell = require('shelljs');

shell.cp('-u', './server/assets/*.py', './dist/assets/');
shell.cp('-u', './server/assets/pdf.worker.js', './node_modules/pdfjs-dist/build/');
