# -*- coding: utf-8 -*-
"""
Automatically detect rotation and line spacing of an image of text using
Radon transform
If image is rotated by the inverse of the output, the lines will be
horizontal (though they may be upside-down depending on the original image)
It doesn't work with black borders

Courtesy: https://gist.github.com/endolith/334196bac1cac45a4893#
"""

from __future__ import division, print_function
import warnings
warnings.filterwarnings("ignore")
import sys
from PIL import Image
from skimage.transform import radon
from numpy import asarray, mean, array, sqrt, mean
try:
    # More accurate peak finding from
    # https://gist.github.com/endolith/255291#file-parabolic-py
    from parabolic import parabolic

    def argmax(x):
        import numpy
        return parabolic(x, numpy.argmax(x))[0]
except ImportError:
    from numpy import argmax

def rms_flat(y):
    return sqrt(mean(y**2))

def compute_rotation_in_degrees(filename):
    I = asarray(Image.open(filename).convert('L'))
    J = I - mean(I)
    sinogram = radon(J)
    r = array([rms_flat(line) for line in sinogram.transpose()])
    rotation = argmax(r)
    return rotation

def main():
    try:
        filename = str(sys.argv[1])
        rotation = compute_rotation_in_degrees(filename)
        print('{:.2f}'.format(rotation))
        sys.stdout.flush()
        sys.exit(0)
    except Exception as e:
        print('error')
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()