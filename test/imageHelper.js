/*global  describe, beforeEach, afterEach, i, it*/
"use strict";
var assert = require('assert'),
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	externalUrl = 'http://upload.wikimedia.org/wikipedia/commons/4/4f/Big%26Small_edit_1.jpg',
	image = "/home/zurer/Hide stuff/temp/images/stamps/egypttobaccotax.png",
	fs = require('fs'),
	spawn = require('child_process').spawn,
	Stream = require('stream'),
	imagemagick = require('imagemagick'),
	common = require('../../common/modules/common').common(),
	sut = require('../modules/imageHelper').imageHelper(imagemagick, spawn, Stream, fs);
describe('module_imageHelper', function () {
	describe('getFileBytes', function () {
		it("when input is undefined should throw", function () {
			var input,
				expected = "File size cannot be parsed [" + undefined + "]";
			try {
				sut.getFileBytes(input);
			} catch (actual) {
				assert.strictEqual(actual, expected);
			}
		});
		it("when input is whitespace should throw", function () {
			var input = "   ",
				expected = "File size cannot be parsed [" + input + "]";
			try {
				sut.getFileBytes(input);
			} catch (actual) {
				assert.strictEqual(actual, expected);
			}
		});
		it("when input length is less than 4 should throw", function () {
			var input = "MBB",
				expected = "File size cannot be parsed [" + input + "]";
			try {
				sut.getFileBytes(input);
			} catch (actual) {
				assert.strictEqual(actual, expected);
			}
		});
		it("when input does not end with KBB, MBB or GBB should throw", function () {
			var input = "2.4TBB",
				expected = "File size cannot be parsed [" + input + "]";
			try {
				sut.getFileBytes(input);
			} catch (actual) {
				assert.strictEqual(actual, expected);
			}
		});
		it("when input is not a number should throw", function () {
			var input = "2._foo_5GBB",
				expected = "File size cannot be parsed [" + input + "]";
			try {
				sut.getFileBytes(input);
			} catch (actual) {
				assert.strictEqual(actual, expected);
			}
		});
		it("when input is in kilobytes should return input times one thousand", function () {
			var input = "0.253KBB",
				expected = 253,
				actual = sut.getFileBytes(input);
			assert.strictEqual(actual, expected);
		});
		it("when input is in megabytes should return input times one million", function () {
			var input = "2.7MBB",
				expected = 2700000,
				actual = sut.getFileBytes(input);
			assert.strictEqual(actual, expected);
		});
		it("when input is in gigabytes should return input times one billion", function () {
			var input = "172.600GBB",
				expected = 172600000000,
				actual = sut.getFileBytes(input);
			assert.strictEqual(actual, expected);
		});
	});
	describe('validateSize', function () {
		it("should throw when limit is undefined", function (done) {
			var error;	
			try {
				sut.validateSize(image, undefined);			
			} catch (err) {
				error = err;
			}
			assert.strictEqual(error, "Limit muxt be greater than zero");
			done();
		});
		it("should return true when file from disk is greater than limit", function (done) {
			var callback = function (isTooBig) {
				assert.ok(isTooBig);
				done();		
			}
			sut.validateSize(image, 871000, callback)
		});
		it("should return false when file from disk is less than limit", function (done) {
			var callback = function (isTooBig) {
				assert.ok(!isTooBig);
				done();		
			}
			sut.validateSize(image, 900000, callback)
		});
		it("should return true when file from url is greater than limit", function (done) {
			var callback = function (isTooBig) {
				assert.ok(isTooBig);
				done();		
			}
			sut.validateSize(externalUrl, 455000, callback)
		});
		it("should return false when file from url is less than limit", function (done) {
			var callback = function (isTooBig) {
				assert.ok(!isTooBig);
				done();		
			}
			sut.validateSize(externalUrl, 500000, callback)
		});	});
	describe('getFeatures', function () {
		it("should get width height and format from file on disk", function (done) {
			var callback = function (features) {
					assert.strictEqual(features.format, 'PNG');
					assert.strictEqual(features.width, 556);
					assert.strictEqual(features.height, 768);
					assert.strictEqual(features.filesize, '892KBB');
					done();
				};
			sut.getFeatures(image, callback);
		});
		it("should get width height and format from url", function (done) {
			var callback = function (features) {
				assert.strictEqual(features.format, 'JPEG');
				assert.strictEqual(features.width, 1000);
				assert.strictEqual(features.height, 664);
				assert.strictEqual(features.filesize, '456KBB');
				done();
			};
			sut.getFeatures(externalUrl, callback);
		});
	});
	describe('resizeFromUrl', function () {
		it("should get an image from a url, resize and pipe it into a stream", function (done) {
			var streamOut = fs.createWriteStream(folderPath +  "resized_file_from_url.jpg"),
				callback = function (stream) {
					stream.pipe(streamOut);
					stream.on('end', function () {
						fs.unlink(folderPath + "resized_file_from_url.jpg");
						done();
					});
				};
			sut.resizeFromUrl(externalUrl, 30, callback);
		});
	});
	describe('resizeFromFile', function () {
		it("should get an image from disk resize and pipe it into a stream", function (done) {
			var filePath = folderPath +  "file_to_upload.png",
				streamOut = fs.createWriteStream(folderPath +  "resized_file_from_disk.png"),
				callback = function (stream) {
					stream.pipe(streamOut);
					stream.on('end', function () {
						fs.unlink(folderPath + "resized_file_from_disk.png");
						done();
					});
				};
			sut.resizeFromFile(filePath, 30, callback);
		});
	});

});

