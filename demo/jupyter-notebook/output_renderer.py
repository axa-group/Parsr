import uuid
import json
from IPython.display import display, Markdown, display_html, display_javascript
from pygments import highlight
from pygments.lexers import JsonLexer
from pygments.formatters import TerminalFormatter

def RenderJSON(dict):
    json_object = json.loads(json.dumps(dict))
    json_str = json.dumps(json_object, indent=4, sort_keys=True)
    print(highlight(json_str, JsonLexer(), TerminalFormatter()))

class RenderBigJSON(object):
    def __init__(self, json_data):
        if isinstance(json_data, dict) or isinstance(json_data, list):
            self.json_str = json.dumps(json_data)
        else:
            self.json_str = json_data
        self.uuid = str(uuid.uuid4())

    def _ipython_display_(self):
        display_html('<div id="{}" style="height: 600px; width:100%;font: 12px/18px monospace !important;"></div>'.format(self.uuid), raw=True)
        display_javascript("""
        require(["https://rawgit.com/caldwell/renderjson/master/renderjson.js"], function() {
            renderjson.set_show_to_level(2);
            document.getElementById('%s').appendChild(renderjson(%s))
        });
      """ % (self.uuid, self.json_str), raw=True)

class RenderMarkdown(object):
    def __init__(self, markdown_data):
        self.markdown_data = markdown_data
        self.uuid = str(uuid.uuid4())

    def _ipython_display_(self):
        display(Markdown(self.markdown_data))