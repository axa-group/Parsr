const { join } = require('path');

module.exports = ['/bin/bash', '-c', join(__dirname, '/darwin.bash.sh')];
