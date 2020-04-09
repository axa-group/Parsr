/**
 * Copyright 2020 AXA Group Operations S.A.
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
