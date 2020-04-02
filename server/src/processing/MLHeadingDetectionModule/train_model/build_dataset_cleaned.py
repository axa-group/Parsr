import argparse
import os
import pandas as pd
import spacy
from utils import text_case

pd.options.mode.chained_assignment = None  # default='warn'

# Load English tokenizer, tagger, parser, NER and word vectors
nlp = spacy.load("en_core_web_sm")


parser = argparse.ArgumentParser(description='Receive cleaned csv files and determining the following features: word_count, text_case, nb_of_verbs, nb_of_nouns, nb_of_cardinal_numbers')
parser.add_argument('custom_train_csv', help='folder containing the cleaned csv files')
args = parser.parse_args()

paths = os.listdir(args.custom_train_csv)

for path in paths:
    new_path = os.path.join(args.custom_train_csv, path)
    df = pd.read_csv(new_path, sep=',', header=0)

    for i in range(len(df)):
        df['word_count'][i] = len(df['line'][i].split())
        df['text_case'][i] = text_case(df['line'][i])

        doc = nlp(str(df['line'][i]))
        df['nb_of_verbs'][i] = len([token.lemma_ for token in doc if token.pos_=="VERB"])
        df['nb_of_nouns'][i] = len([chunk.text for chunk in doc.noun_chunks])
        df['nb_of_cardinal_numbers'][i] = len([entity.text for entity in doc.ents if entity.label_=="CARDINAL"])

    df.to_csv(new_path, index=False)

        

