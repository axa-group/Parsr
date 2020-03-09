const { tmpdir } = require('os');
const tmp = tmpdir();

const commands = [
  `curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh -o ${tmp}/brew-install.sh`,
  `sh ${tmp}/brew-install.sh`,
  'brew install node qpdf imagemagick tesseract tesseract-lang tcl-tk ghostscript mupdf-tools pandoc',
  `curl https://bootstrap.pypa.io/get-pip.py -o ${tmp}/get-pip.py`,
  `python ${tmp}/get-pip.py`,
  'pip install pdfminer.six camelot-py[cv]',
];

module.exports = ['/bin/bash', '-c', `"$(${commands.join(';')})"`];
