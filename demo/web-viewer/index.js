/**
 * Copyright 2019 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const util = require('util');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const filetype = require('file-type');
const express = require('express');
const multer = require('multer');

const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, `${__dirname}/pipeline/upload/`);
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		},
	}),
});

const localStorage = require('./localStorage');
const storage = localStorage.from(`${__dirname}/storage.json`);
// localStorage.autoSave = true;

const app = express();

// config module and the configuration file path
const configModule = require(`${__dirname}/../../dist/src/types/Config`);
const configFilePath = path.resolve(`${__dirname}/../../server/defaultConfig.json`);

let defaultConfig;
if (fs.existsSync(configFilePath)) {
	let configFile = fs.readFileSync(configFilePath, 'utf-8');
	defaultConfig = new configModule.Config(JSON.parse(configFile));
	var cp = require('child_process');

	console.log('Config read successfully from', configFilePath);
	console.log(
		util.inspect(defaultConfig, {
			colors: true,
			breakLength: 10,
		}),
	);
} else {
	console.log('ERROR: The config file', configFilePath, 'does not exist. Specify a valid path.');
	return process.exit(1);
}

app.use(express.static(`${__dirname}/public`));
app.use('/static/', express.static(`${__dirname}/node_modules/dropzone/dist/`));
app.use('/static/', express.static(`${__dirname}/node_modules/jquery/dist/`));
app.use('/static/', express.static(`${__dirname}/node_modules/riot/`));
app.use('/static/', express.static(`${__dirname}/node_modules/bootstrap/dist/`));

app.get('/status/:id', (req, res) => {
	res.json(storage[req.params.id]);
});

app.get('/analysed/:id', (req, res) => {
	fs.readFile(
		`${__dirname}/pipeline/4_analysed/${storage[req.params.id].originalname}.txt.json`,
		'utf8',
		(err, data) => {
			if (err) {
				console.log(err);
			}
			res.send(data);
		},
	);
});

app.get('/json', (req, res) => {
	let files = fs.readdirSync(`${__dirname}/pipeline/output`);

	files = files
		.filter(f => f[0] !== '.')
		.filter(f => f.substring(f.length - 5).toLowerCase() === '.json');

	res.json(files);
});

app.get('/json/:id', (req, res) => {
	console.log(decodeURIComponent(req.params.id));
	let path = `${__dirname}/pipeline/output/${decodeURIComponent(req.params.id)}`;
	if (!fs.existsSync(path)) {
		res.sendStatus(404);
		return;
	}

	let file = JSON.parse(fs.readFileSync(path, 'utf8'));
	res.json(file);
});

app.get('/extracted', (req, res) => {
	let files = fs.readdirSync(`${__dirname}/pipeline/6_extracted`);

	let contract = [];
	for (let i = 0; i < files.length; ++i) {
		if (files[i][0] === '.') {
			continue;
		}
		let data = fs.readFileSync(`${__dirname}/pipeline/6_extracted/${files[i]}`);
		contract.push({
			name: files[i],
			data: JSON.parse(data),
		});
	}

	res.json(contract);
});

app.post('/upload', upload.single('file'), (req, res) => {
	req.setTimeout(0x7fffffff);
	const fileObjectData = req.file;
	const baseName = fileObjectData.originalname.substring(
		0,
		fileObjectData.originalname.lastIndexOf('.'),
	);
	const configPath = `${os.tmpdir()}/${baseName}-config-${crypto
		.randomBytes(15)
		.toString('hex')}.json`;
	console.log('BASENAME', baseName);
	const documentId = baseName;

	fileObjectData.id = fileObjectData.filename;
	storage[fileObjectData.filename] = fileObjectData;

	let config = null;

	if (req.body.config) {
		try {
			config = JSON.stringify(JSON.parse(req.body.config));
			fs.writeFileSync(configPath, config);
		} catch (e) {
			res.status(400).send(e);
		}
	}

	let fileType = filetype(
		fs.readFileSync(`${__dirname}/pipeline/upload/${fileObjectData.filename}`),
	);

	if (!config) {
		if (
			!fileType ||
			fileType.ext === 'pdf' ||
			fileType.ext === 'xml' ||
			fileType.mime.slice(0, 5) === 'image'
		) {
			fs.writeFileSync(configPath, JSON.stringify(defaultConfig));
		} else {
			res.status(400).send('Input file is neither a PDF nor an image');
		}
	}

	processPDF(fileObjectData.filename, documentId, configPath, res);
});

function processPDF(pdfFile, documentId, configName, res) {
	console.log('Processing ' + pdfFile);

	debugFlag = true ? 'pipeline' : '';
	process.env.NODE_DEBUG = debugFlag;

	let args = [
		`../../dist/bin/index.js`,
		'--input-file',
		`${__dirname}/pipeline/upload/${pdfFile}`,
		'--output-folder',
		`${__dirname}/pipeline/output`,
		'--document-name',
		documentId,
		'--config',
		path.resolve(configName),
		'--pretty-logs',
	];

	let extractor = spawn(`node`, args, {
		env: process.env,
	});

	extractor.stdout.pipe(process.stdout);
	extractor.stderr.pipe(process.stdout);

	// FIXME don't redirect if code !== 0
	extractor.on('exit', function(code) {
		console.log('Child process exited with code ' + code.toString());
		res.json({
			filename: documentId + '.json',
		});
	});
}

try {
	fs.mkdirSync(`${__dirname}/pipeline`);
} catch (e) {
	// noop: folder already exists
}

try {
	fs.mkdirSync(`${__dirname}/pipeline/output`);
} catch (e) {
	// noop: folder already exists
}

try {
	fs.mkdirSync(`${__dirname}/pipeline/upload`);
} catch (e) {
	// noop: folder already exists
}

let port = process.argv[2] || 3000;
const server = app.listen(port, () => {
	const host = server.address().address === '::' ? '[::]' : server.address().address;
	const port = server.address().port;
	console.log(`App listening at http://${host}:${port}`);
});

process.on('exit', function(code) {
	return console.log(`Exitting with code ${code}`);
});
