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
			var filePath = folderPath +  "file_to_copy_x.jpg",
				streamOut800 = fs.createWriteStream(folderPath +  "resized_file_800.jpg"),
				streamOut300 = fs.createWriteStream(folderPath +  "resized_file_300.jpg"),
				streamOut30 = fs.createWriteStream(folderPath +  "resized_file_30.jpg"),
				callback800 = function (stream) {
					stream.pipe(streamOut800);
					stream.on('end', function () {
						fs.unlink(folderPath + "resized_file_800.jpg");
						fs.unlink(folderPath + "resized_file_300.jpg");
						fs.unlink(folderPath + "resized_file_30.jpg");
						done();
					});
				},
				callback300 = function (stream) {
					stream.pipe(streamOut300);
					stream.on('end', function () {
						sut.resizeFromFile(filePath, 800, callback800);
					});
				},
				callback30 = function (stream) {
					stream.pipe(streamOut30);
					stream.on('end', function () {
						sut.resizeFromFile(filePath, 300, callback300);
					});
				};
			sut.resizeFromFile(filePath, 30, callback30);
		});
	});

});

