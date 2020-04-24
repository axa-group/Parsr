import logging
import webview

from contextlib import redirect_stdout
from io import StringIO
from threading import Thread, Lock
from time import sleep
from .server import run_server

server_lock = Lock()

logger = logging.getLogger(__name__)


def url_ok(url, port):
	# Use httplib on Python 2
	try:
		from http.client import HTTPConnection
	except ImportError:
		from httplib import HTTPConnection

	try:
		conn = HTTPConnection(url, port)
		conn.request('GET', '/')
		r = conn.getresponse()
		return r.status == 200
	except:
		logger.exception('Server not started')
		return False

def main():
	stream = StringIO()
	with redirect_stdout(stream):
		logger.debug('Starting server')
		t = Thread(target=run_server)
		t.daemon = True
		t.start()
		logger.debug('Checking server')

		while not url_ok('127.0.0.1', 23948):
			sleep(1)

		logger.debug('Server started')
		window = webview.create_window('Doc Versioning', 'http://127.0.0.1:23948')
		webview.start(debug=True)


if __name__ == '__main__':
	main()
