from collections import Counter
from bs4 import BeautifulSoup
from markdown import markdown
import re

def mostCommonFont(file):
    """Takes the most common font of a file"""
    fonts_ids = []
    def walk(node):
        if node['type'] == 'line':
            for word in node['content']:
                fonts_ids.append(word['font'])
        elif node['type'] == 'paragraph' or node['type'] == 'heading' or node['type'] == 'list':
            for line in node['content']:
                walk(line)

    for page in file['pages']:
        # skip pages that have no elements
        if len(page['elements']) > 0:
            for element in page['elements']:
                walk(element)
    
    if len(fonts_ids) > 0:
        return file['fonts'][Counter(fonts_ids).most_common(1)[0][0] - 1]

    # for pages that have no elements (i.e. no fonts) as "FLYER1.pdf.json"
    return {}


def markdown_to_text(markdown_string):
    """ Converts a markdown string to plaintext """

    # md -> html -> text since BeautifulSoup can extract text cleanly
    html = markdown(markdown_string)

    # remove code snippets
    html = re.sub(r'<pre>(.*?)</pre>', ' ', html)
    html = re.sub(r'<code>(.*?)</code >', ' ', html)

    # extract text
    soup = BeautifulSoup(html, "html.parser")
    text = ''.join(soup.findAll(text=True))

    return text