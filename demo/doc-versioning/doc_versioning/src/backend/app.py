"""
Doc Versioning application stub
"""
from parsr_client import ParsrClient

def initialize():
	print('App initialized')

def doMagic(filename:str, config:str):
	parsr = ParsrClient('localhost:3001')
	response = parsr.send_document(filename, config)

	# do the magic here
	
	return response
