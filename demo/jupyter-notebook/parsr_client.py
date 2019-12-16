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

from glob import glob
from itertools import chain
import os
import sys
import json
import time

from sxsdiff import DiffCalculator
from sxsdiff.generators.github import GitHubStyledGenerator

import diff_match_patch
import pandas as pd
import requests
from io import StringIO



class ParserClient():
	def __init__(self, server):
		self.version_history = {}
		self.set_server(server)
		self.set_current_request_id("")

	def __supported_input_files(self) -> list:
		return ['*.pdf', '*.jpg', '*.jpeg', '*.png', '*.tiff', '*.tif',]

	def set_server(self, server:str):
		self.server = server

	def set_current_request_id(self, request_id:str):
		self.request_id = request_id

	def send_document(self, file:str, config:str, server:str="", document_name:str=None, wait_till_finished:bool=False, save_request_id:bool=False) -> dict:
		if server == "":
			if self.server == "":
				raise Exception('No server address provided')
			else:
				server = self.server
		packet = {
			'file': (file, open(file, 'rb'), 'application/pdf'),
			'config': (config, open(config, 'rb'), 'application/json'),
		}
		r = requests.post('http://'+server+'/api/v1/document', files=packet)
		jobId = r.text
		if not document_name:
			document_name = os.path.splitext(os.path.basename(file))[0]
		if document_name not in self.version_history:
			self.version_history[document_name] = [jobId]
		else:
			self.version_history[document_name].append(jobId)
		if save_request_id:
			self.set_current_request_id(jobId)
		if not wait_till_finished:
			return {'file': file, 'config': config, 'status_code': r.status_code, 'server_response': r.text}
		else:
			print('> Polling server for the job {}...'.format(jobId))
			server_status_response = self.get_status(jobId)['server_response']
			while ('progress-percentage' in server_status_response):
				print('>> Progress percentage: {}'.format(server_status_response['progress-percentage']))
				time.sleep(2)
				server_status_response = self.get_status(jobId)['server_response']
			print('>> Job done!')
			return {'file': file, 'config': config, 'status_code': r.status_code, 'server_response': r.text}

	def get_versions(self, document_name:str) -> list:
		if document_name in self.version_history:
			return self.version_history[document_name]
		else:
			return []

	def send_documents_folder(self, folder:str, config:str, server:str="") -> list:
		if server == "":
			if self.server == "":
				raise Exception('No server address provided')
			else:
				server = self.server
		responses = []
		os.chdir(folder)
		files = [glob.glob(e) for e in self.__supported_input_files()]
		files_flat = list(chain.from_iterable(files))
		for file in files_flat:
			packet = {
				'file': (file, open(file, 'rb'), 'application/pdf'),
				'config': (config, open(config, 'rb'), 'application/json'),
			}
			r = requests.post('http://'+server+'/api/v1/document', files=packet)
			responses.append({'file': file, 'config': config, 'status_code': r.status_code, 'server_response': r.text})
		return responses

	def get_status(self, request_id:str="", server:str=""):
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
		r = requests.get('http://{}/api/v1/queue/{}'.format(server, request_id))
		return {'request_id': request_id, 'server_response': json.loads(r.text)}

	def get_json(self, request_id:str="", server:str=""):
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
		r = requests.get('http://{}/api/v1/json/{}'.format(server, request_id))
		if r.text != "":
			return r.json()
		else:
			return {'request_id': request_id, 'server_response': r.json()}

	def get_markdown(self, request_id:str="", server:str=""):
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
		r = requests.get('http://{}/api/v1/markdown/{}'.format(server, request_id))
		if r.text != "":
			return r.text
		else:
			return {'request_id': request_id, 'server_response': r.text}

	def get_text(self, request_id:str="", server:str=""):
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
		r = requests.get('http://{}/api/v1/text/{}'.format(server, request_id))
		if r.text != "":
			return r.text
		else:
			return {'request_id': request_id, 'server_response': r.text}

	def get_table(self, request_id:str="", page=None, table=None, seperator=";", server:str=""):
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
			r = requests.get('http://{}/api/v1/csv/{}'.format(server, request_id))
		else:
			r = requests.get('http://{}/api/v1/csv/{}/{}/{}'.format(server, request_id, page, table))
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

	def compare_versions(self, request_ids:list, pretty_html:bool = False):
		diffs = []
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
