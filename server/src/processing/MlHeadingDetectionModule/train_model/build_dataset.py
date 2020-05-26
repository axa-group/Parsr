import argparse
import csv
import json as json
import os
import re
import spacy
import numpy as np
from collections import Counter
from utils import most_common_font, font_ratios, markdown_to_text


# Load English tokenizer, tagger, parser, NER and word vectors
nlp = spacy.load("en_core_web_sm")

def walk_line(filename_line, node_line, acc_line, common_font, font_ratios):
    line = ''
    fonts_ids = []
    is_title_case = True
    for word in node_line['content']:
        text = word['content']
        if len(text) > 4:
            is_title_case = is_title_case and (
                bool(re.match(r'^[A-Z]\w+', text)) or bool(re.match(r'^(?:\W*\d+\W*)+\w+', text)))

        fonts_ids.append(word['font'])
        line += text + ' '

    line_font = filename_line['fonts'][Counter(fonts_ids).most_common(1)[0][0] - 1]  # font ids start at 1
    is_bold = all(filename_line['fonts'][font_id - 1]['weight'] == 'bold' for font_id in fonts_ids)
    line_font_ratio = font_ratios[line_font['id']]

    if line.islower():
        text_case = 0
    elif line.isupper():
        text_case = 1
    elif is_title_case:
        text_case = 2
    else:
        text_case = 3

    doc = nlp(line)
    nb_verbs = len([token.lemma_ for token in doc if token.pos_=="VERB"])
    nb_nouns = len([chunk.text for chunk in doc.noun_chunks])
    nb_cardinal = len([entity.text for entity in doc.ents if entity.label_=="CARDINAL"])
                
    acc_line.append([line.strip(), int(is_bold^(common_font['weight'] == 'bold')), int(line_font['size']>common_font['size']),
                int(line_font['color']!=common_font['color']), int(len(set(fonts_ids))==1), text_case,
                len(node_line['content']), int(bool(re.match(r'^\d*\.?\d*$', line.strip()))),
                nb_verbs, nb_nouns, nb_cardinal,
                line_font['size'], int(is_bold), line_font_ratio,
                0, 'paragraph', False
               ])

def walk(filename, node, acc, common_font, font_ratios):
    elements_to_consider = {'paragraph', 'heading', 'list'}
    if node['type'] == 'line':
        walk_line(filename, node, acc, common_font, font_ratios)

    elif node['type'] in elements_to_consider:
        for elem in node['content']:
            walk(filename, elem, acc, common_font, font_ratios)


def extract_lines(file):
    lines = []
    common_font = most_common_font(file)
    font_ratios_dict = font_ratios(file)
    for page in file['pages']:
        for element in page['elements']:
            walk(file, element, lines, common_font, font_ratios_dict)
    return lines


parser = argparse.ArgumentParser(description='Extracts features to csv from .json files using .md files as labels')
parser.add_argument('md_dir', help='folder containing the .md files (labels)')
parser.add_argument('json_dir', help='folder containing the .json files (data)')
parser.add_argument('out_dir', help='folder in which to save the .csv files')
args = parser.parse_args()

paths = os.listdir(args.json_dir)

for path in paths:
    END_JSON_PATH = '.pdf.json'
    if path.endswith(END_JSON_PATH):
        print(path)

        with open(os.path.join(args.json_dir, path), mode='r', encoding='utf8') as f:
            file = json.load(f)

        with open(os.path.join(args.md_dir, path.replace(END_JSON_PATH, '.md')), mode='r', encoding='utf8') as f:
            md = f.readlines()

        contract = extract_lines(file)
        for md_line in md:
            if md_line.startswith('#'):
                # counting the number of '#'
                level = len(md_line.split()[0])
                text_line = markdown_to_text(md_line)
                for i, line in enumerate(contract):
                    if contract[i][-1]:
                        continue
                    if line[0] == text_line or (line[0] in text_line and line[7] == 0 and ((line[1] and line[4]) or line[2] or line[3])):
                        contract[i][-3] = level
                        contract[i][-2] = 'heading'
                        contract[i][-1] = True

        if len(contract) != 0:
            # delete the last column that was used to avoid overwriting
            contract = np.array(contract)[:,:-1]
        col_names = ['line', 'is_different_style', 'is_font_bigger', 
                     'different_color', 'is_font_unique', 'text_case',
                     'word_count', 'is_number', 'nb_of_verbs',
                     'nb_of_nouns', 'nb_of_cardinal_numbers', 'font_size',
                     'is_bold', 'font_ratio', 'level', 'label']

        with open(os.path.join(args.out_dir, path.replace(END_JSON_PATH, '.csv')), newline='\n',  mode='w+', encoding='utf8') as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerow(col_names)
            writer.writerows(contract)
