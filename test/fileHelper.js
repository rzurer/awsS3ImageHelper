/*global  describe, beforeEach, afterEach, i, it*/
"use strict";
var assert = require('assert'),
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	fs = require('fs'),
	url = require('url'),
	http = require('http'),
	https = require('https'),
	sut = require('../modules/fileHelper').fileHelper(fs, http, https, url),
	tearDown = function () {
		fs.unlink(folderPath + "copied_file.jpg");
		fs.unlink(folderPath + "downloaded_file.png");
	};
describe('module_fileHelper', function () {
	afterEach(tearDown);
	it("saveFromFile should copy a file on disk ", function (done) {
		var inputPath = folderPath +  "file_to_copy_x.jpg",
			outputPath = folderPath +  "copied_file.jpg";
		sut.saveFromFile(inputPath, outputPath, function () { done(); });
	});
	it("saveFromUrl should save a file from a url to disk", function (done) {
		var inputUrl = "https://s3.amazonaws.com/philatopedia/HingedStamp.png",
			outputPath = folderPath +  "downloaded_file.png";
		sut.saveFromUrl(inputUrl, outputPath, function () { done(); });
	});
	it("getFileSizeFromUrl should return file size of remote file", function (done) {
		var url = "http://www.stamp-photos.com/pictures/1821.jpg",
			expected = 45627;
		sut.getFileSizeFromUrl(url, function (actual) {
			assert.strictEqual(actual, expected);
			done();
		});
	});
});