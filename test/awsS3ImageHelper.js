/*global  describe, beforeEach, afterEach, it*/
"use strict";
var assert = require('assert'),
	http = require('http'),
	Emitter = require('events').EventEmitter,
	emitter = new Emitter(),
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
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	regularImageY = folderPath + "file_to_copy_y.jpg", //18428  bytes
	regularImageX = folderPath + "file_to_copy_x.jpg", //137247  bytes
	oversizeImage = "/home/zurer/Hide stuff/temp/images/stamps/Aust2pt.jpg", //2169972  bytes
	sut = require('../modules/awsS3ImageHelper').awsS3ImageHelper(awsS3Helper, imageHelper, fileHelper, emitter);
	
describe('module_awsS3ImageHelper', function () {
	describe('uploadFromFile', function () {
		describe('when file is larger than the size limit specified in the options', function () {
			it("should notify", function (done) {
				var callback;
				callback = function (err) {
					assert.strictEqual(err, "The maximum file size has been exceeded [200000]");
					done();
				};
				sut.on("error", callback);
				sut.uploadFromFile(oversizeImage);
			});
		});
		describe('when widths are specified', function () {
			it("should upload the original and one resized image per width to s3", function (done) {
				var fileNames = [],
					deleteFiles = function (featuresArray) {
						featuresArray.forEach(function (features) {
							fileNames.push(features.s3FileName);
						});
						awsS3Helper.deleteFiles(fileNames, function (err, res) {
							assert.strictEqual(res.statusCode, 200);
							done();
						});
					};
				sut.on("end", deleteFiles);
				sut.uploadFromFile(regularImageX);
			});
		});
	});
});