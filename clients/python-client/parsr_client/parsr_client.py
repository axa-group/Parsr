#
# Copyright 2020 AXA Group Operations S.A.
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

from glob import glob
from itertools import chain
from io import StringIO
from os import path
from os import chdir
from json import loads
from time import sleep
from ast import literal_eval
from pandas import read_csv
from pandas import notnull
from requests import post
from requests import get
from semver import VersionInfo

import diff_match_patch
from sxsdiff import DiffCalculator
from sxsdiff.generators.github import GitHubStyledGenerator


class ParsrClient():
    """The Parsr client class with all the necessary functions to connect to,
    send and receive data to/from the Parsr server using the API.
    """

    def __init__(self, server: str, revision_history: dict = {}):
        """Constructor for the class.

        - server: The address of the server. For example: 'localhost:3001'
        - revision_history: The revision history of a client, if a previous
        state is to be restored.
        """
        self.set_server(server)
        self.set_revision_history(revision_history)
        self.set_current_request_id("")

    def __supported_input_files(self) -> list:
        """Returns the file extensions supported as input files for Parsr
        """
        return ['*.pdf', '*.jpg', '*.jpeg', '*.png', '*.tiff',
                '*.tif', '*.docx', '*.xml', '*.eml' '*.json']

    def set_server(self, server: str):
        """Setter for the Parsr server's address
        """
        self.server = server

    def set_revision_history(self, revision_history: dict):
        """Set a previous revision history for the client
        """
        self.revision_history = revision_history

    def set_current_request_id(self, request_id: str):
        """Set the current request_id for the client
        """
        self.request_id = request_id

    def send_document(
            self,
            file_path: str,
            config_path: str,
            server: str = "",
            document_name: str = None,
            revision: str = 'major',
            wait_till_finished: bool = False,
            refresh_period: int = 2,
            save_request_id: bool = False,
            silent: bool = True) -> dict:
        """Send the document to the Parsr server

        - file: The address of the file to be sent to the server
        - config: The configuration file to be sent with the request
        - document_name: The name of the document
        - revision: Type of revision (major or minor) of the document
        - wait_till_finished: Should the sending be blocking or not
        - refresh_period: How often the server is to be polled to see
        if the job has finished
        - save_request_id: If set to true, will remember the current
        job and it won't have to be specified again
        - silent: If set to false, each polling request will be logged.
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
                packet = {
                    'file': (
                        file_path,
                        open(file_path, 'rb'),
                        'application/pdf'),
                    'config': (config_path,
                               open(config_path, 'rb'),
                               'application/json'),
                }
                r = post(
                    'http://' + server + '/api/v1/document',
                    files=packet)
                jobId = r.text
        if not document_name:
            document_name = path.splitext(path.basename(file_path))[0]
        if document_name not in self.revision_history:
            self.revision_history[document_name] = {
                str(VersionInfo.parse('1.0.0')): jobId
            }
        else:
            latest_revision = max(VersionInfo.parse(i) for i in list(
                self.revision_history[document_name].keys()))
            if revision == 'major':
                new_revision = latest_revision.bump_major()
            elif revision == 'minor':
                new_revision = latest_revision.bump_minor()
                self.revision_history[document_name][str(new_revision)] = jobId
        if save_request_id:
            self.set_current_request_id(jobId)
        if not wait_till_finished:
            return {
                'file': file_path,
                'config': config_path,
                'status_code': r.status_code,
                'server_response': r.text}
        else:
            print('> Polling server for the job {}...'.format(jobId))
            server_status_response = self.get_status(jobId)['server_response']
            while ('progress-percentage' in server_status_response):
                if not silent:
                    print(
                        '>> Progress percentage: {}'.format(
                            server_status_response['progress-percentage']))
                    sleep(refresh_period)
                    server_status_response = self.get_status(jobId)[
                        'server_response']
                    print('>> Job done!')
            return {
                'file': file_path,
                'config': config_path,
                'status_code': r.status_code,
                'server_response': r.text}

    def get_request_id(self, document_name: str, revision: str) -> str:
        """Gets the request ID from a document name and a revision ID

        - document_name: The name of the document
        - revision: The ID of the revision being queried
        """
        if document_name in self.revision_history:
            if revision in self.revision_history[document_name].keys():
                return self.revision_history[document_name][revision]
            else:
                print(
                    'Revision {} not found for document {}'.format(
                        revision, document_name))
        else:
            print('Document name {} not found'.format(document_name))
        return ""

    def get_revisions(self, document_name: str) -> list:
        """Get a list of all the revisions given a document name

        - document_name: The name of the document
        """
        if document_name in self.revision_history:
            return list(self.revision_history[document_name].keys())
        else:
            return []

    def get_document_name_from_request_id(self, request_id: str) -> str:
        """Get the name of a document knowing only its request ID

        - request_id: the request id for which the document is to be searched
        """
        for document_name in list(self.revision_history.keys()):
            if request_id in [self.revision_history[document_name][i]
                              for i in list(
                                      self.revision_history[document_name]
                              )]:
                return document_name
        return ""

    def compare_revisions(
            self,
            document_name: str,
            revisions: list = [],
            pretty_html: bool = False) -> list:
        """Compare two documents and return the diff between them

        - document_name: the name of the document
        - revisions: the list of revisions to be taken into consideration.
        When nothing is supplied, all the revisions of the document are
        compared
        - pretty_html: if a general diff is to be returned or should a pretty
        html document is to be generated instead
        """
        diffs = []
        if len(revisions) == 0:
            revisions = self.get_revisions(document_name)
            request_ids = [
                self.get_request_id(
                    document_name,
                    i) for i in revisions]
        for i in range(0, len(request_ids) - 1):
            request_id1 = request_ids[i]
            request_id2 = request_ids[i + 1]
            md1 = self.get_markdown(request_id1)
            md2 = self.get_markdown(request_id2)

            if pretty_html:
                sxsdiff_result = DiffCalculator().run(md1, md2)
                html_store = StringIO()
                GitHubStyledGenerator(file=html_store).run(sxsdiff_result)
                html_diff = html_store.getvalue()
                diffs.append(html_diff)
            else:
                dmp = diff_match_patch.diff_match_patch()
                diff = dmp.diff_main(md1, md2)
                dmp.diff_cleanupSemantic(diff)
                diffs.append(diff)
        return diffs

    def send_documents_folder(
            self,
            folder: str,
            config: str,
            server: str = "") -> list:
        """Send all the files inside a folder

        - folder: The name of the folder to be sent to Parsr
        - config: The address to the configuration file to be used
        for treating the documents
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
                responses = []
                chdir(folder)
                files = [glob(e) for e in self.__supported_input_files()]
                files_flat = list(chain.from_iterable(files))
        for file in files_flat:
            packet = {
                'file': (file, open(file, 'rb'), 'application/pdf'),
                'config': (config, open(config, 'rb'), 'application/json'),
            }
            r = post(
                'http://' +
                server +
                '/api/v1/document',
                files=packet)
            responses.append({'file': file,
                              'config': config,
                              'status_code': r.status_code,
                              'server_response': r.text})
        return responses

    def get_status(self, request_id: str = "", server: str = ""):
        """Get the status of a partcular request using its ID

        - request_id: The ID of the request to be queried with the server
        - server: The server address where the query is to be made
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
        if request_id == "":
            if self.request_id == "":
                raise Exception('No request ID provided')
            else:
                request_id = self.request_id
        if self.server == "":
            raise Exception('No server address provided')
        r = get(
            'http://{}/api/v1/queue/{}'.format(server, request_id))
        return {
            'request_id': request_id,
            'server_response': loads(
                r.text)}

    def get_json(self, request_id: str = "", server: str = ""):
        """Fetch the Parsr's output JSON file (result) given a particular
        request

        - request_id: The ID of the request to be queried with the server
        - server: The server from which the JSON is to be fetched
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
        if request_id == "":
            if self.request_id == "":
                raise Exception('No request ID provided')
            else:
                request_id = self.request_id
                r = get(
                    'http://{}/api/v1/json/{}'.format(server, request_id))
        if r.text != "":
            return r.json()
        else:
            return {'request_id': request_id, 'server_response': r.json()}

    def get_markdown(self, request_id: str = "", server: str = ""):
        """Fetch the Parsr's output Markdown file (result) given a particular
        request

        - request_id: The ID of the request to be queried with the server
        - server: The server from which the result is to be fetched
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
        if request_id == "":
            if self.request_id == "":
                raise Exception('No request ID provided')
            else:
                request_id = self.request_id
                r = get(
                    'http://{}/api/v1/markdown/{}'.format(server, request_id))
        if r.text != "":
            return r.text
        else:
            return {'request_id': request_id, 'server_response': r.text}

    def get_text(self, request_id: str = "", server: str = ""):
        """Fetch the Parsr's output Text file (result) given a particular
        request

        - request_id: The ID of the request to be queried with the server
        - server: The server from which the result is to be fetched
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
        if request_id == "":
            if self.request_id == "":
                raise Exception('No request ID provided')
            else:
                request_id = self.request_id
                r = get(
                    'http://{}/api/v1/text/{}'.format(server, request_id))
        if r.text != "":
            return r.text
        else:
            return {'request_id': request_id, 'server_response': r.text}

    def get_tables_info(self, request_id: str = ""):
        """Fetch the list and location of tables detected inside a particular
        document.
        """
        return [(table.rsplit('/')[-2], table.rsplit('/')[-1])
                for table in literal_eval(
                        self.get_table(request_id=request_id).columns[0])]

    def get_table(
            self,
            request_id: str = "",
            page=None,
            table=None,
            seperator=";",
            server: str = "",
            column_names: list = None):
        """Get a particular table from a processed document.

        - request_id: The request to be queried to get a document.
        - page: The page number on which the queried table exists.
        - table: The table number to be fetched.
        - seperator: The seperator to be used between table cells (default ';')
        - server: The server address which is to be queried.
        - column_names: The headings of the table searched (column titles)
        """
        if server == "":
            if self.server == "":
                raise Exception('No server address provided')
            else:
                server = self.server
        if request_id == "":
            if self.request_id == "":
                raise Exception('No request ID provided')
            else:
                request_id = self.request_id
        if page is None and table is None:
            r = get('http://{}/api/v1/csv/{}'.format(server, request_id))
        else:
            r = get('http://{}/api/v1/csv/{}/{}/{}'.format(server,
                                                           request_id,
                                                           page,
                                                           table))
        if r.text != "":
            try:
                df = read_csv(
                    StringIO(
                        r.text),
                    sep=seperator,
                    names=column_names)
                df.loc[:, ~df.columns.str.match('Unnamed')]
                df = df.where((notnull(df)), " ")
                return df
            except Exception:
                return r.text
        else:
            return r.text
