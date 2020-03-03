const { spawn } = require('child_process');
const { platform } = require('os');

const w32Cmds = [
  "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))",
  'choco install imagemagick.app -PackageParameters LegacySupport=true -PackageParameters installDevelopmentTools=true -y',
  'choco install nodejs-lts python ghostscript qpdf pandoc -y',
  'choco install tesseract --pre -y',
  'curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py; refreshenv',
  'python get-pip.py; refreshenv',
  'pip install pdfminer.six camelot-py[cv]',
];

const commands = {
  win32: [
    'powershell.exe',
    ['-Command', `Start-Process powershell -verb runAs "${w32Cmds.join('; ')}"`],
  ],
};

function promisifySpawn(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(cmd, args);
    process.on('close', code => {
      resolve(code);
    });
    process.on('error', err => {
      reject(err);
    });
  });
}

function install(platform) {
  if (commands.hasOwnProperty(platform)) {
    const [cmd, args] = commands[platform];
    promisifySpawn(cmd, args)
      .then(code => code)
      .catch(console.error);
  } else {
    console.warn('Missing installation script for ' + platform);
  }
}

install(platform());
