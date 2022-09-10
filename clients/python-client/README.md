# Parsr Client

Provides a python interface to the Parsr tool via its API.
Parsr transforms PDF, documents and images into enriched, structured data.

Find out all about Parsr (including download) at [https://github.com/axa-group/Parsr](https://github.com/axa-group/Parsr).

## 1 Installation

```sh
pip install parsr-client
```

## 2 Usage

_Make sure that the Parsr Server is already running. Let us suppose that the address is `localhost:3001`_

### 2.1 Connect to the Parsr server

```python
from parsr_client import ParsrClient
parsr = ParsrClient('localhost:3001')
```

### 2.2 Send the document

```python
parsr.send_document(
   file_path='README.pdf',
   config_path='defaultConfig.json',
   document_name='The Readme',
   save_request_id=True)
```

### 2.4 Retrieve results

1. Get everything as a JSON:

    ```python
    parsr.get_json()
    ```

2. As Markdown:

    ```python
    parsr.get_markdown()
    ```

3. As text:

    ```python
    parsr.get_text()
    ```

4. Get the first table on the first page:

    ```python
    parsr.get_table(
        page=1,
        table=1,
    )
    ```

5. Get all the versions of the document:

    ```python
    parsr.get_revisions('The Readme')
    ```

6. Get pretty diffs between each successive pair of a document's revisions:

    ```python
    parsr.compare_revisions('The Readme', pretty_html=True)
    ```

## 3 Interpreting the whole JSON output locally

The supplied `ParsrOutputInterpreter` class can be used to interpret the downloaded JSON output and generate higher level structures like the text body.

Here's an example to generate text body on the first page from the above example.

``` python
from parsr_client import ParsrOutputInterpreter

parsr_interpreter = ParsrOutputInterpreter(
    parsr.get_json()
)

t = parsr_interpreter.get_text(
    page_number=1
)
print(t)
```
