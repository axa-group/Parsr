#!/bin/bash 

ERROR='\033[0;31m'
OK='\033[32m'
INFO='\033[34m'
NO_COLOR='\033[0m'

check_brew() {
    echo -e "\n${INFO}=> Checking brew installation...${NO_COLOR}"
    which -s brew
    if [[ $? != 0 ]] ; then
        echo -e "Brew is not installed. Installing..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
    else
        brew update
    fi
}

check_python3() {
    echo -e "\n${INFO}=> Checking python3 installation...${NO_COLOR}"
    which python3
    if [[ $? != 0 ]] ; then
        while true; do
            read -n1 -p "Python 3 is not installed. Do you want to install it via homebrew (y/n)? " yn
            case $yn in
                [Yy]* ) echo -e "\nInstalling..."; brew install python; break;;
                [Nn]* ) echo -e "\n${ERROR}Please install python3 and run the script again${NO_COLOR}"; exit 1;;
                * ) echo " Please answer yes or no.";;
            esac
        done
    fi
}

check_pip() {
    echo -e "\n${INFO}=> Checking pip installation...${NO_COLOR}"

    tmp=$(mktemp -d -t pip-install) 
    curl https://bootstrap.pypa.io/get-pip.py -o $tmp/get-pip.py

    which pip
    if [[ $? != 0 ]] ; then
        echo -e "Pip2 is not installed. Installing..."
        python $tmp/get-pip.py
    fi
    
    which pip3
    if [[ $? != 0 ]] ; then
        echo -e "Pip 3 is not installed. Installing..."
        python3 $tmp/get-pip.py
    fi

    rm -rf $tmp
}

# Check that brew, python3 and pip are installed
check_brew
check_python3
check_pip

# Install brew dependencies
echo -e "\n${INFO}=> Installing dependencies via brew...${NO_COLOR}"
brew install qpdf imagemagick tesseract tesseract-lang tcl-tk ghostscript mupdf-tools pandoc

# Install python3 dependencies
echo -e "\n${INFO}=> Installing python3 dependencies...${NO_COLOR}"
pip3 install pillow
pip3 install pdfminer.six
pip3 install camelot-py[cv]

# Install python2 dependencies
echo -e "\n${INFO}=> Installing python2 dependencies...${NO_COLOR}"
python2.7 -m pip install PyPDF2
