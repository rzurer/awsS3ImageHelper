/*global  describe, beforeEach, afterEach, it*/
"use strict";
var folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	oversizeImage = "/home/zurer/Hide stuff/temp/images/stamps/Aust2pt.jpg", //2170000 bytes
	//filePath = folderPath + "file_to_copy.jpg",
	assert = require('assert'),
	http = require('http'),
	https = require('https'),
	url = require('url'),
    fs = require('fs'),
    mime = require('mime'),
	knox = require('knox'),
	spawn = require('child_process').spawn,
	Stream = require('stream'),
	imagemagick = require('imagemagick'),
	common = require('../../common/modules/common').common(),
	fileHelper = require('../modules/fileHelper').fileHelper(fs, http, https, url),
	awsS3Helper = require('../modules/awsS3Helper').awsS3Helper(common, fs, mime, knox, fileHelper),
	imageHelper = require('../modules/imageHelper').imageHelper(imagemagick, spawn, Stream, fs),
	options = {maximumFileSize : 200000 },
	fileName = 'uploadedFile',
	awsUrl = "https://philatopedia.s3.amazonaws.com/",
	sut = require('../modules/awsS3ImageHelper').awsS3ImageHelper(awsS3Helper, imageHelper, options);
describe('module_awsS3ImageHelper', function () {
	describe('uploadFromFile', function () {
		describe('when file is larger than the size limit specified in the options', function () {
			it("should notify", function (done) {
				var callback;
				callback = function (err, res) {
					assert.strictEqual(err, "The maximum file size has been exceeded [200000]");
					done();
				};
				sut.uploadFromFile(oversizeImage, fileName, [], callback);
			});
		});
		describe('when widths are specified', function () {
			it("should upload the original and one resized image per width to s3", function (done) {
				var callback, deleteCallback, fileNames;
				var filePath = folderPath + "file_to_copy_y.jpg",
				fileNames = [];
				deleteCallback = function (err, res) {
					assert.strictEqual(res.statusCode, 200);
					done();
				};
				callback = function (featuresArray) {
					featuresArray.forEach(function (features) {
						fileNames.push(features['base filename']);
					})
					awsS3Helper.deleteFiles(fileNames, deleteCallback);
				};
				sut.uploadFromFile(filePath, fileName, [800, 300, 30], callback);
			});
		});
	});
});