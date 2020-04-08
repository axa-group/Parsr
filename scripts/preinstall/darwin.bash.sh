#!/bin/bash 

tmp_dir=$(mktemp -d -t parsr-install) 

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)" &&
brew install python qpdf imagemagick tesseract tesseract-lang tcl-tk ghostscript mupdf-tools pandoc &&
curl https://bootstrap.pypa.io/get-pip.py -o $tmp_dir/get-pip.py &&
python3 $tmp_dir/get-pip.py &&
python $tmp_dir/get-pip.py &&
pip3 install pdfminer.six camelot-py[cv] &&
python -m pip install PyPDF2 &&
rm -rf $tmp_dir
