const { spawn } = require('child_process');
const { platform } = require('os');

const commands = {
  win32: require('./windows.commands'),
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

function install() {
  const osPlatform = platform();
  if (commands.hasOwnProperty(osPlatform)) {
    const [cmd, ...args] = commands[osPlatform];
    if (cmd) {
      return promisifySpawn(cmd, args)
        .then(code => {
          console.log('Finished process with code', code);
          console.log('Please close this window in order to refresh the PATH variable.');
        })
        .catch(console.error);
    }
  } else {
    console.warn('Missing installation script for', osPlatform, 'platform.');
  }
}

install();
