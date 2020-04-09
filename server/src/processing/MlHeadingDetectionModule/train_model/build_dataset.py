import argparse
import csv
import json as json
import os
import re
import spacy
from collections import Counter
from utils import mostCommonFont, markdown_to_text

# Load English tokenizer, tagger, parser, NER and word vectors
nlp = spacy.load("en_core_web_sm")


def extract_lines(file):
    commonFont = mostCommonFont(file)
    def walk(node, acc):
        if node['type'] == 'line':
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
                
            acc.append([line.strip(), is_bold^(commonFont['weight'] == 'bold'), line_font['size']>commonFont['size'],
                        line_font['color']!=commonFont['color'], len(set(fonts_ids))==1, text_case, len(node['content']),
                        nb_verbs, nb_nouns, nb_cardinal, 'paragraph'
                       ])

        elif node['type'] == 'paragraph' or node['type'] == 'heading' or node['type'] == 'list':
            for line in node['content']:
                walk(line, acc)

    lines = []
    for page in file['pages']: 
        for element in page['elements']:
            walk(element, lines)

    return lines


parser = argparse.ArgumentParser(description='Extracts features to csv from .json files using .md files as labels')
parser.add_argument('md_dir', help='folder containing the .md files (labels)')
parser.add_argument('json_dir', help='folder containing the .json files (data)')
parser.add_argument('out_dir', help='folder in which to save the .csv files')
args = parser.parse_args()

paths = os.listdir(args.json_dir)

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
                text_line = markdown_to_text(md_line)
                for i, line in enumerate(contract):
                    if line[0] == text_line:
                        contract[i][-1] = 'heading'
                    elif line[0] in text_line:
                        if (line[1] and line[4]) or line[2] or line[3] or (line[5]==2 and line[6]>1):
                            contract[i][-1] = 'heading'

        col_names = ['line', 'is_different_style', 'is_font_bigger', 
                     'different_color', 'is_font_unique', 'text_case', 'word_count',
                     'nb_of_verbs', 'nb_of_nouns', 'nb_of_cardinal_numbers', 'label']

        with open(os.path.join(args.out_dir, path.replace('.pdf.json', '.csv')), newline='\n',  mode='w+', encoding='utf8') as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerow(col_names)
            writer.writerows(contract)

