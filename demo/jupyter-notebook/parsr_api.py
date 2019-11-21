#
# Copyright 2019 AXA Group Operations S.A.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import sys
if sys.version_info[0] < 3: 
    from StringIO import StringIO
else:
    from io import StringIO
import pandas as pd
import requests
import os
from glob import glob
from itertools import chain
import magic
mime = magic.Magic(mime=True)


class ParserApi:
    def __init__(self, server:str):
        self.server = server
        self.jobId = None

    def __supported_input_files(self) -> list:
        return ['*.pdf', '*.jpg', '*.jpeg', '*.png', '*.tiff', '*.tif',]

    def sendDocument(self, file:str, config:str) -> dict:
        packet = {
            'file': (file, open(file, 'rb'), 'application/pdf'),
            'config': (config, open(config, 'rb'), 'application/json'),
        }
        r = requests.post('http://'+self.server+'/api/v1/document', files=packet)
        return {'file': file, 'config': config, 'status_code': r.status_code, 'server_response': r.text}

    def sendDocumentsFromFolder(self, folder:str, config:str) -> list:
        responses = []
        os.chdir(folder)
        files = [glob.glob(e) for e in self.__supported_input_files()]
        files_flat = list(chain.from_iterable(files))
        for file in files_flat:
            packet = {
                'file': (file, open(file, 'rb'), 'application/pdf'),
                'config': (config, open(config, 'rb'), 'application/json'),
            }
            r = requests.post('http://'+self.server+'/api/v1/document', files=packet)
            responses.append({'file': file, 'config': config, 'status_code': r.status_code, 'server_response': r.text})
        return responses

    def getStatus(self, request_id):
        r = requests.get('http://{}/api/v1/queue/{}'.format(self.server, request_id))
        return {'request_id': request_id, 'server_response': r.text}

    def getJson(self, request_id):
        r = requests.get('http://{}/api/v1/json/{}'.format(self.server, request_id))
        if r.text != "":
            return r.text
        else:
            return {'request_id': request_id, 'server_response': r.json()}

    def getMarkdown(self, request_id):
        r = requests.get('http://{}/api/v1/markdown/{}'.format(self.server, request_id))
        if r.text != "":
            return r.text
        else:
            return {'request_id': request_id, 'server_response': r.text}

    def getText(self, request_id):
        r = requests.get('http://{}/api/v1/text/{}'.format(self.server, request_id))
        if r.text != "":
            return r.text
        else:
            return {'request_id': request_id, 'server_response': r.text}

    def getCsv(self, request_id, page=None, table=None, seperator=";"):
        if page is None and table is None:
            r = requests.get('http://{}/api/v1/csv/{}'.format(self.server, request_id))
        else:
            r = requests.get('http://{}/api/v1/csv/{}/{}/{}'.format(self.server, request_id, page, table))
        if r.text != "":
            try:
                df = pd.read_csv(StringIO(r.text), sep=seperator)
                df.loc[:, ~df.columns.str.match('Unnamed')]
                df = df.where((pd.notnull(df)), " ")
                return df
            except Exception as e:
                return {'request_id': request_id, 'server_response': r.text}
        else:
            return {'request_id': request_id, 'server_response': r.text}