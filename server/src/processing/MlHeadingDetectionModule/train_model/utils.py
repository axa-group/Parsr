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

def get_fonts_ids(file, page_number):
    """Gives all fonts of a file (page_number = 0) or by page if specified"""
    fonts_ids = []
    for page in file['pages']:
        if len(page['elements']) > 0 and (page_number == 0 or page['pageNumber'] == page_number):
            for element in page['elements']:
                walk(element, fonts_ids)

    return fonts_ids

def most_common_fonts(file, page_number, threshold):
    """Gives the most common fonts of the entire file or by page if specified"""
    fonts_ids = get_fonts_ids(file, page_number)
    if len(fonts_ids) > 0:
        most_common_list = Counter(fonts_ids).most_common(threshold)
        common_fonts = [file['fonts'][most_common_list[i][0] - 1] for i in range(len(most_common_list))]
        return common_fonts

    # for pages that have no elements (i.e. no fonts)
    return []

def font_ratios(file, page_number):
    """Gives the font ratios of the entire file or by page if specified"""
    font_ratios = Counter()
    fonts_ids = get_fonts_ids(file, page_number)    
    if len(fonts_ids) > 0:
        for font in fonts_ids:
            font_ratios[str(font) + '_' + str(page_number)] += 1/len(fonts_ids)

    return font_ratios

def markdown_to_text(markdown_string):
    """Converts a markdown string to plaintext"""

    # md -> html -> text since BeautifulSoup can extract text cleanly
    html = markdown(markdown_string)

    # remove code snippets
    html = re.sub(r'<pre>(.*?)</pre>', ' ', html)
    html = re.sub(r'<code>(.*?)</code >', ' ', html)

    # extract text
    soup = BeautifulSoup(html, "html.parser")
    text = ''.join(soup.findAll(text=True))

    return text
