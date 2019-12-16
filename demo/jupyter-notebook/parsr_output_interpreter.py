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

import logging
import pandas as pd
from io import StringIO

class ParsrOutputInterpreter(object):
	def __init__(self, object=None):
		logging.basicConfig(level=logging.DEBUG, format='%(name)s - %(levelname)s - %(message)s')
		self.object = None
		if object is not None:
			self.load_object(object)
	
	def __get_text_types(self):
		return ['word', 'line', 'character', 'paragraph', 'heading']

	def __get_text_objects(self, page_number=None):
		texts = []
		if page_number is not None:
			page = self.get_page(page_number)
			if page is None:
				logging.error("Cannot get text elements for the requested page; Page {} not found".format(page_number))
				return None
			else:
				for element in page['elements']:
					if element['type'] in self.__get_text_types():
						texts.append(element)
		else:
			for page in self.object['pages']:
				for element in page['elements']:
					if element['type'] in self.__get_text_types():
						texts.append(element)
		return texts
	
	def __text_from_text_object(self, text_object:dict) -> str:
		result = ""
		if text_object['type'] in ['paragraph', 'heading']:
			for i in text_object['content']:
				result += self.__text_from_text_object(i)
		elif text_object['type'] in ['line']:
			for i in text_object['content']:
				result += self.__text_from_text_object(i)
		elif text_object['type'] in ['word']:
			if type(text_object['content']) is list:
				for i in text_object['content']:
					result += self.__text_from_text_object(i)
			else:
				result += text_object['content']
				result += ' '
		elif text_object['type'] in ['character']:
			result += text_object['content']
		return result
	
	def load_object(self, object):
		self.object = object

	def get_page(self, page_number):
		for p in self.object['pages']:
			if p['pageNumber'] == page_number:
				return p
		logging.error("Page {} not found".format(page_number))
		return None

	def get_text(self, page_number:int=None) -> str:
		final_text = ""
		for textObj in self.__get_text_objects(page_number):
			final_text += self.__text_from_text_object(textObj)
			final_text += "\n\n"
		return final_text
