/*global  describe, beforeEach, afterEach, it*/
"use strict";
var assert = require('assert'),
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	fs = require('fs'),
	spawn = require('child_process').spawn,
	Stream = require('stream'),
	imagemagick = require('imagemagick'),
    mime = require('mime'),
	knox = require('knox'),
	common = require('../../common/modules/common').common(),
	awsS3Helper = require('../modules/awsS3Helper').awsS3Helper(common, fs, mime, knox),
	imageHelper = require('../modules/imageHelper').imageHelper(imagemagick, spawn, Stream, fs),
	sut = require('../modules/awsS3ImageHelper').awsS3ImageHelper(awsS3Helper, imageHelper);
describe('module_awsS3ImageHelper', function () {
	describe('initialize', function () {
	});
});