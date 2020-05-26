from collections import Counter
from bs4 import BeautifulSoup
from markdown import markdown
import re


def walk(node, fonts_ids):
    elements_to_consider = {'paragraph', 'heading', 'list'}
    if node['type'] == 'line':
        for word in node['content']:
            fonts_ids.append(word['font'])
    elif node['type'] in elements_to_consider:
        for elem in node['content']:
            walk(elem, fonts_ids)

def most_common_font(file):
    """Gives the most common font of a file"""
    fonts_ids = []
    for page in file['pages']:
        # skip pages that have no elements
        if len(page['elements']) > 0:
            for element in page['elements']:
                walk(element, fonts_ids)
    if len(fonts_ids) > 0:
        return file['fonts'][Counter(fonts_ids).most_common(1)[0][0] - 1]

    # for pages that have no elements (i.e. no fonts) as "FLYER1.pdf.json"
    return {}

def font_ratios(file):
    """Gives the font ratios of the entire file"""
    fonts_ids = []
    font_ratios = Counter()
    for page in file['pages']:
        if len(page['elements']) > 0:
            for element in page['elements']:
                walk(element, fonts_ids)
    if len(fonts_ids) > 0:
        for font in fonts_ids:
            font_ratios[font] += 1/len(fonts_ids)

    return font_ratios

def font_ratios_by_page(file, page_number):
    """Gives the font ratios by page"""
    fonts_ids = []
    font_ratios = Counter()
    for page in file['pages']:
        if page['pageNumber'] == page_number and len(page['elements']) > 0:
            for element in page['elements']:
                walk(element, fonts_ids)
    if len(fonts_ids) > 0:
        for font in fonts_ids:
            font_ratios[str(font) + '_' + str(page_number)] += 1/len(fonts_ids)

    return font_ratios

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
