# Parsr - Jupyter Notebook

This folder includes a [jupyter notebook](./notebook.ipynb), which shows how a user can access the API using a python interface, showing the following functions:

1. Connecting to the Parsr API.
2. Sending a document (or a folder) to the Parsr API.
3. Retrieving the complete JSON output.
4. Retrieving other output formats such as Markdown, text, and tables (CSV and Pandas Dataframes).
5. Using the [parsr output interpreter class](../../clients/python-client/parsr_client/parsr_output_interpreter.py), which reconstructs usable elements from an already downloaded Parsr outputted JSON file.

## Installation

Install [pipenv](https://pipenv.readthedocs.io/en/latest/install/#installing-pipenv), then issue the following inside this folder (`demo/parsr-jupyter-demo`):

```sh
pipenv install
```

## Usage

To start the jupyter notebook, issue:

```sh
pipenv run jupyter lab notebook.ipynb
```
