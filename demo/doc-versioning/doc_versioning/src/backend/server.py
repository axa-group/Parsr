import json
import os
import webbrowser
from functools import wraps
import time

from flask import Flask, url_for, render_template, jsonify, request, make_response
import webview
from . import app

from parsr_client import ParsrClient

gui_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'gui')  # development path

if not os.path.exists(gui_dir):  # frozen executable path
	gui_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gui')

server = Flask(__name__, static_folder=gui_dir, template_folder=gui_dir)
server.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1  # disable caching

parsr = ParsrClient('localhost:3001')

def verify_token(function):
	@wraps(function)
	def wrapper(*args, **kwargs):
		data = json.loads(request.data)
		token = data.get('token')
		if token == webview.token:
			return function(*args, **kwargs)
		else:
			raise Exception('Authentication error')

	return wrapper


@server.after_request
def add_header(response):
	response.headers['Cache-Control'] = 'no-store'
	return response


@server.route('/')
def landing():
	"""
	Render index.html. Initialization is performed asynchronously in initialize() function
	"""
	return render_template('index.html', token=webview.token)


@server.route('/init', methods=['POST'])
@verify_token
def initialize():
	'''
	Perform heavy-lifting initialization asynchronously.
	:return:
	'''
	can_start = app.initialize()

	if can_start:
		response = {
			'status': 'ok',
		}
	else:
		response = {
			'status': 'error'
		}

	return jsonify(response)


@server.route('/choose/path', methods=['POST'])
@verify_token
def choose_path():
	'''
	Invoke a file selection dialog here
	:return:
	'''
	files = webview.windows[0].create_file_dialog(webview.OPEN_DIALOG)
	if files and len(files) > 0:
		the_file = files[0]
		if isinstance(the_file, bytes):
			the_file = the_file.decode('utf-8')

		response = {'status': 'ok', 'file': the_file}
	else:
		response = {'status': 'cancel'}

	return jsonify(response)


@server.route('/fullscreen', methods=['POST'])
@verify_token
def fullscreen():
	webview.windows[0].toggle_fullscreen()
	return jsonify({})


@server.route('/open-url', methods=['POST'])
@verify_token
def open_url():
	url = request.json['url']
	webbrowser.open_new_tab(url)

	return jsonify({})


@server.route('/do/magic', methods=['POST'])
@verify_token
def doMagic():
	my_path = os.path.abspath(os.path.dirname(__file__))
	filename = request.json['filename']
	result = parsr.send_document(filename, my_path + '/defaultConfig.json')

	if result:
		response = {'status': 'ok', 'result': result}
	else:
		response = {'status': 'error'}

	return jsonify(response)

@server.route('/poll', methods=['POST'])
@verify_token
def poll_server():
	jobID = request.json['jobID']
	result = parsr.get_status(jobID)

	while ('progress-percentage' in result['server_response'].keys()):
		result = parsr.get_status(jobID)
		time.sleep(1)

	if result:
		response = {'status': 'ok', 'result': result, 'docName': parsr.get}
	else:
		response = {'status': 'error'}

	return jsonify(response)

@server.route('/document/<doc_name>', methods=['POST'])
@verify_token
def document(doc_name):
	return render_template('document.html', token=webview.token)


def run_server():
	server.run(host='127.0.0.1', port=23948, threaded=True)


if __name__ == '__main__':
	run_server()
