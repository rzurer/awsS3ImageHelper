/*global  describe, beforeEach, afterEach, it*/
"use strict";
var awsUrl = "https://philatopedia.s3.amazonaws.com/",
    folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	filePath = folderPath + "file_to_upload.png",
	fileName = "s3UploadedFile",
	expected = awsUrl + fileName,
	buffer = new Buffer('now is the time for all good men to come to the aid of their party'),
	userId = '    bob     ',
	expectedUserUrl = awsUrl + userId.trim() + '/' +  fileName,

	assert = require('assert'),
	http = require('http'),
	https = require('https'),
	url = require('url'),
    fs = require('fs'),
    mime = require('mime'),
	knox = require('knox'),
	common = require('../../common/modules/common').common(),
	fileHelper = require('../modules/fileHelper').fileHelper(fs, http, https, url),
	sut = require('../modules/awsS3Helper').awsS3Helper(common, fs, mime, knox, fileHelper),
	tearDown = function () {
		fs.unlink(folderPath + "resized_file_from_url.jpg");
		fs.unlink(folderPath + "resized_file_from_disk.png");
		fs.unlink(folderPath + "copied_file.jpg");
		fs.unlink(folderPath + "downloaded_file.png");
	};
describe('awsS3Helper_module', function () {
	afterEach(tearDown);
	describe('uploadFile', function () {
		it("should upload file to s3", function (done) {
			var actual, callback;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadFile(filePath, fileName, callback);
		});
		it('should throw when file path is not provided', function (done) {
			var callback = function (err, res) {
				assert.strictEqual(34, err.errno);
				assert.strictEqual("ENOENT", err.code);
				assert.strictEqual("", err.path);
				done();
			};
			sut.uploadFile('', fileName, callback);
		});
		it('should return bad request when file name is not provided', function (done) {
			var actual, callback;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(400, res.statusCode);
				assert.strictEqual(actual, awsUrl);
				done();
			};
			sut.uploadFile(filePath, '', callback);
		});
		it("should add trimmed userId to storage name when provided and upload file to s3", function (done) {
			var actual, callback;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expectedUserUrl);
				done();
			};
			sut.uploadFile(filePath, fileName, callback, userId);
		});
	});
	describe('uploadBuffer', function () {
		it("should upload a buffer to s3", function (done) {
			var actual, callback;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadBuffer(buffer, fileName, callback);
		});
		it("should add trimmed userId to storage name when provided and upload a buffer to s3", function (done) {
			var actual, callback;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expectedUserUrl);
				done();
			};
			sut.uploadBuffer(buffer, fileName, callback, userId);
		});
	});
	describe('uploadStream', function () {
		it("should upload file to s3 from stream", function (done) {
			var actual, stream, callback;
			stream  = fs.createReadStream(filePath);
			callback = function (err, res) {
				var actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadStream(stream, fileName, callback);
		});
		it("should add trimmed userId to storage name when provided and upload file to s3 from stream", function (done) {
			var actual, stream, callback;
			stream  = fs.createReadStream(filePath);
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expectedUserUrl);
				done();
			};
			sut.uploadStream(stream, fileName, callback, userId);
		});
    });
	describe('download', function () {
		it("should download file from s3", function (done) {
			var callback;
			callback = function (err, res) {
				var actual, expected;
				expected = awsUrl + fileName;
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.download(fileName, callback);
		});
		it("should return 404 when not found", function (done) {
			var callback = function (err, res) {
				assert.strictEqual(404, res.statusCode);
				done();
			};
			sut.download("notfound", callback);
		});

	});

});