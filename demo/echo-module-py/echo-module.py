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

from http.server import BaseHTTPRequestHandler, HTTPServer
import json

PORT = 8888

class PostHandler(BaseHTTPRequestHandler):
	def do_POST(self):

		content_length = int(self.headers['Content-Length'])
		post_data = self.rfile.read(content_length)
		json_data = json.loads(post_data)

		new_json_data = process_data(json_data)

		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()
		self.wfile.write(json.dumps(new_json_data).encode('utf8'))

def run(server_class=HTTPServer, handler_class=PostHandler, port=PORT):
	server_address = ('', port)
	httpd = server_class(server_address, handler_class)
	print('Starting httpd on port {}'.format(port))
	httpd.serve_forever()

def process_data(data):
	# Modify JSON as you want
	return data


if __name__ == "__main__":
	from sys import argv

	if len(argv) == 2:
		run(port=int(argv[1]))
	else:
		run()
