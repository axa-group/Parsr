
const commands = [
  'Set-ExecutionPolicy Bypass -Scope Process -Force',
  '[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072',
  "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))",
  'choco install imagemagick.app -PackageParameters LegacySupport=true -PackageParameters installDevelopmentTools=true -y',
  'choco install python ghostscript qpdf pandoc mupdf -y',
  'choco install tesseract --pre -y',
  'curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py',
  "[System.Environment]::SetEnvironmentVariable('Path', [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')); refreshenv",
  'python get-pip.py',
  'pip install pdfminer.six camelot-py[cv] PyPDF2',
  'npm i --global windows-build-tools'
];

module.exports = [
  'powershell.exe',
  '-Command',
  `Start-Process powershell -Wait -Verb RunAs "${commands.join('; ')}"`,
];
