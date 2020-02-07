from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfparser import PDFParser
from pdfminer.pdftypes import resolve1

import sys

def main():
    try:      
      with open(sys.argv[1], 'rb') as f:        
        parser = PDFParser(f)
        doc = PDFDocument(parser)
        parser.set_document(doc)
        pages = resolve1(doc.catalog['Pages'])
        count = pages.get('Count', 0)
        print(count)

    except Exception as e:
        print(e)
        sys.stdout.flush()
        sys.exit(1)


if __name__ == '__main__':
    main()
