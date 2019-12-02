#!/usr/bin/env python
"""
This script performs all (TODO Deskewing) steps to improve Tesseract accuracy:
See --> https://github.com/tesseract-ocr/tesseract/wiki/ImproveQuality
"""
from __future__ import print_function

import numpy as np
import cv2 as cv
import json
import math
from scipy import ndimage

# built-in modules
import os
import sys


def transparentToWhite(image):
    # If alpha transparency
    if(image.shape[2] == 4):
        #convert transparent to white
        alpha_channel = image[:, :, 3]
        _, mask = cv.threshold(alpha_channel, 254, 255, cv.THRESH_BINARY)  # binarize mask
        color = image[:, :, :3]
        image = cv.bitwise_not(cv.bitwise_not(color, mask=np.uint8(mask)))

    return image

def removeShadow(image):
    rgb_planes = cv.split(image)
    result_planes = []
    for plane in rgb_planes:
        dilated_img = cv.dilate(plane, np.ones((9,9), np.uint8))
        bg_img = cv.medianBlur(dilated_img, 11)
        diff_img = 255 - cv.absdiff(plane, bg_img)
        result_planes.append(diff_img)

        # dilated_img = cv.dilate(plane, np.ones((4,4), np.uint8))
        # bg_img = cv.medianBlur(dilated_img, 7)
        # diff_img = 255 - cv.absdiff(plane, bg_img)
        # result_planes.append(diff_img)

    return cv.merge(result_planes)

def detectRotation(image):
    img_gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    img_edges = cv.Canny(img_gray, 100, 100, apertureSize=3)
    lines = cv.HoughLinesP(img_edges, 1, math.pi / 180.0, 100, minLineLength=100, maxLineGap=5)

    angles = []
    for line in lines:
        for x1, y1, x2, y2 in line:
            #cv2.line(image, (x1, y1), (x2, y2), (255, 255, 0), 1)
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            angles.append(angle)

    median_angle = np.median(angles)
    return median_angle

def getRotationData(originalImage, rotatedImage, angle, outputFile):
    (oh, ow) = originalImage.shape[:2]
    (rh, rw) = rotatedImage.shape[:2]
    outputData = dict()
    origin = dict()
    origin['x'] = str(int(rw/2))
    origin['y'] = str(int(rh/2))
    outputData['origin'] = origin
    translation = dict()
    translation['x'] = str(int((ow-rw)/2))
    translation['y'] = str(int((oh-rh)/2))
    outputData['translation'] = translation
    outputData['degrees'] = str(int(angle))
    outputData['filename'] = outputFile

    return json.dumps(outputData)

def main():
    try:
        src = sys.argv[1]
        originalImage = cv.imread(src, cv.IMREAD_UNCHANGED)

        # Remove transparency from pngs
        noTransparentImage = transparentToWhite(originalImage);
        # Image Rotation
        angle = detectRotation(noTransparentImage)
        rotatedImage = ndimage.rotate(noTransparentImage, angle, cval=255)
        # Remove shadows
        shadowsOut = removeShadow(rotatedImage)
        shadowsOut = cv.copyMakeBorder(shadowsOut, 2, 2, 2, 2, cv.BORDER_CONSTANT, value=[1, 0, 0])
        #save cropped image
        outputFile = src.split('.')[0]+'-corrected.'+'.'.join(src.split('.')[1:])
        cv.imwrite(outputFile, shadowsOut)
        
        
        print(getRotationData(originalImage, rotatedImage, angle, outputFile))
        sys.stdout.flush()
        sys.exit(0)

    except Exception as e:
        print(e)
        sys.stdout.flush()
        sys.exit(1)

if __name__ == '__main__':
    main()
