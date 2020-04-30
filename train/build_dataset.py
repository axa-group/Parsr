import argparse
import csv
import json as json
import os
import re
from collections import Counter

def walk_line(file, node, acc):
    line = ''
    fonts_ids = []
    is_title_case = True
    for word in node['content']:
        text = word['content']
        if len(text) > 4:
            is_title_case = is_title_case and (
                bool(re.match(r'^[A-Z]\w+', text)) or bool(re.match(r'^(?:\W*\d+\W*)+\w+', text)))

        fonts_ids.append(word['font'])
        line += text + ' '

    line_font = file['fonts'][Counter(fonts_ids).most_common(1)[0][0] - 1]  # font ids start at 1
    is_bold = all(file['fonts'][font_id - 1]['weight'] == 'bold' for font_id in fonts_ids)

    acc.append([line.strip(), len(node['content']), line_font['size'],
                is_bold, line_font['color'], is_title_case, 'paragraph'])
    return acc

def walk(file, node, acc):
    if node['type'] == 'line':
        return walk_line(file, node, acc)

    elif node['type'] == 'paragraph' or node['type'] == 'heading' or node['type'] == 'list':
        for line in node['content']:
            walk(file, line, acc)

def extract_lines(file):
    lines = []
    for page in file['pages']:
        for element in page['elements']:
            lines = walk(file, element, lines)
    return lines


parser = argparse.ArgumentParser(description='Extracts features to csv from .json files using .md files as labels')
parser.add_argument('md_dir', help='folder containing the .md files (labels)')
parser.add_argument('json_dir', help='folder containing the .json files (data)')
parser.add_argument('out_dir', help='folder in which to save the .csv files')
args = parser.parse_args()

paths = os.listdir(args.json_dir)

contracts = []
for path in paths:
    if path.endswith('.json') and not path.endswith('.stats.json'):
        print(path)

        with open(os.path.join(args.json_dir, path), mode='r', encoding='utf8') as f:
            file = json.load(f)

        with open(os.path.join(args.md_dir, path.replace('.pdf.json', '.md')), mode='r', encoding='utf8') as f:
            md = f.readlines()

        contract = extract_lines(file)
        for md_line in md:
            if md_line.startswith('#'):
                md_line = md_line.replace('#', '').strip()
                for i, line in enumerate(contract):
                    if md_line == line[0]:
                        contract[i][-1] = 'heading'
                    elif line[0] in md_line:
                        line_span = 0

                        # TODO maybe not robust enough
                        for j in range(1, 3):
                            if i + j < len(contract) and contract[i + j][0] in md_line:
                                line_span += 1

                            if i - j >= 0 and contract[i - j][0] in md_line:
                                line_span += 1

                        if line_span > 1:
                            contract[i][-1] = 'heading'

        col_names = ['line', 'word_count', 'font_size', 'is_bold',
                     'color', 'title_case', 'label']

        with open(os.path.join(args.out_dir, path.replace('.pdf.json', '.csv')),
                  newline='\n',  mode='w+', encoding='utf8') as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerow(col_names)
            writer.writerows(contract)

        contracts.append(contract)
