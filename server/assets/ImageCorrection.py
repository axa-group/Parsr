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
from pathlib import Path

import re
import os
import sys
import subprocess

def transparentToWhite(image):
    # If alpha transparency
    if len(image.shape) <= 2:
        return image

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
        dilated_img = cv.dilate(plane, np.ones((5,5), np.uint8))
        bg_img = cv.medianBlur(dilated_img, 11)
        diff_img = 255 - cv.absdiff(plane, bg_img)
        result_planes.append(diff_img)

    return cv.merge(result_planes)

def detectRotation(image):
    img_gray = image.copy()
    #if len(image.shape) >= 3:
    img_gray = cv.cvtColor(image, cv.COLOR_BGR2YUV)
    image_y = np.zeros(img_gray.shape[0:2], np.uint8)
    image_y[:, :] = img_gray[:, :, 0]

    image_blurred = cv.GaussianBlur(image_y, (3, 3), 0)
    img_edges = cv.Canny(image_blurred, 250, 250, apertureSize=3)
    lines = cv.HoughLinesP(img_edges, 1, math.pi / 180.0, 100, minLineLength=100, maxLineGap=20)

    testImage = image.copy()
    angles = []
    for line in lines:
        for x1, y1, x2, y2 in line:
            cv.line(testImage, (x1, y1), (x2, y2), (255, 255, 0), 5)
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            angles.append(angle)

    median_angle = np.median(angles)
    return median_angle

def rotate_image(mat, angle):
  # angle in degrees

  height, width = mat.shape[:2]
  image_center = (width/2, height/2)

  rotation_mat = cv.getRotationMatrix2D(image_center, angle, 1.)

  abs_cos = abs(rotation_mat[0,0])
  abs_sin = abs(rotation_mat[0,1])

  bound_w = int(height * abs_sin + width * abs_cos)
  bound_h = int(height * abs_cos + width * abs_sin)

  rotation_mat[0, 2] += bound_w/2 - image_center[0]
  rotation_mat[1, 2] += bound_h/2 - image_center[1]

  rotated_mat = cv.warpAffine(mat, rotation_mat, (bound_w, bound_h), borderValue=(255,255,255))
  return rotated_mat

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

def isFaceDown(imagePath):
    tesseractOutput = subprocess.Popen(['tesseract', imagePath, "-", "--psm", "0"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=1, universal_newlines=True).stdout.read()
    tesseractRotation = re.search('(?<=Rotate: )\d+', tesseractOutput).group(0)
    if tesseractRotation != '0':
        return True

    return False

def saveImage(image, name):
    if cv.__version__.split(".")[0] == '3':
        cv.imwrite(name, image)
    else:
        cv.imwrite(name, image, [cv.IMWRITE_TIFF_XDPI, 300, cv.IMWRITE_TIFF_YDPI, 300])

def main():
    try:
        src = sys.argv[1]
        originalImage = cv.imread(src)#, cv.IMREAD_UNCHANGED)

        # Remove transparency from pngs
        noTransparentImage = transparentToWhite(originalImage);

        # Image Rotation
        rotatedImage = noTransparentImage.copy()
        angle = detectRotation(noTransparentImage)
        if angle != 0.0:
            rotatedImage = rotate_image(noTransparentImage, angle)
        # Remove shadows
        shadowsOut = removeShadow(rotatedImage)
        shadowsOut = cv.copyMakeBorder(shadowsOut, 2, 2, 2, 2, cv.BORDER_CONSTANT, value=[1, 0, 0])

        #save image
        outputFileName = src.split('.')[0]+'-corrected.'+'.'.join(src.split('.')[1:])
        saveImage(shadowsOut, outputFileName)

        if isFaceDown(outputFileName):
            angle += 180
            shadowsOut = rotate_image(shadowsOut, 180)
            saveImage(shadowsOut, outputFileName)

        print(getRotationData(originalImage, rotatedImage, angle, outputFileName))
        sys.stdout.flush()
        sys.exit(0)

    except Exception as e:
        sys.stderr.write(str(e))
        sys.stderr.flush()
        sys.exit(1)

if __name__ == '__main__':
    main()
