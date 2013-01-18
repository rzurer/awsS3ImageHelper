/*global  describe, beforeEach, afterEach, it*/
"use strict";
var assert = require('assert'),
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	regularImageY = folderPath + "file_to_copy_y.jpg", //18428  bytes
	regularImageX = folderPath + "file_to_copy_x.jpg", //137247  bytes
	oversizeImage = "/home/zurer/Hide stuff/temp/images/stamps/Aust2pt.jpg", //2169972  bytes
	oversizeUrl = "http://oregonstate.edu/events/stamp/images/pauling_300dpi.jpg", //534427 bytes
	regularUrl = "http://farm4.staticflickr.com/3152/2348394335_fa25a6f8f8.jpg",
	knox = require('knox'),
    mime = require('mime'),
    tempPath = '/home/zurer/projects/awsS3ImageHelper/public/temp/',
	fileHelper = require('../modules/fileHelper').fileHelper(tempPath),
	awsS3Helper = require('../modules/awsS3Helper').awsS3Helper(knox, mime, fileHelper),
	imagemagick = require('imagemagick'),
	imageHelper = require('../modules/imageHelper').imageHelper(imagemagick),
	sut,
	setup = function () {
		sut = require('../modules/awsS3ImageHelper').awsS3ImageHelper(awsS3Helper, imageHelper, fileHelper);
	};
describe('module_awsS3ImageHelper', function () {
	beforeEach(setup);
	describe('uploadFromFile', function () {
		describe('when file is larger than the size limit specified in the options', function (done) {
			it("should notify", function (done) {
				var callback = function (actual) {
					var expected = "The maximum file size has been exceeded [Maximum File Size:200000 Actual Size:2169972]";
					assert.strictEqual(actual, expected);
					done();
				};
				sut.once("error", callback);
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
				sut.once("end", deleteFiles);
				sut.uploadFromFile(regularImageX);
			});
		});
	});
	describe('uploadFromUrl', function (done) {
		describe('when remote file is larger than the size limit specified in the options', function () {
			it("should notify", function (done) {
				var callback = function (actual) {
					var expected = "The maximum file size has been exceeded [Maximum File Size:200000 Actual Size:534427]";
					assert.strictEqual(actual, expected);
					done();
				};
				sut.once("error", callback);
				sut.uploadFromUrl(oversizeUrl);
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
				sut.once("end", deleteFiles);
				sut.uploadFromUrl(regularUrl);
			});
		});
	});
});