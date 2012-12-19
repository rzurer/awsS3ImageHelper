/*global  describe, beforeEach, afterEach, it*/
"use strict";
var awsUrl = "https://philatopedia.s3.amazonaws.com/",
	locaUrl = "/home/zurer/projects/awsS3ImageHelper/public/images/",
	fileName = "file_to_upload.png",
	filePath = locaUrl + fileName,
	sinon = require('sinon'),
	assert = require('assert'),
    fs = require('fs'),
    mime = require('mime'),
	knox = require('knox'),
	common = require('../../common/modules/common').common(),
	sut = require('../modules/awsS3Helper').awsS3Helper(common, fs, mime, knox);
describe('awsS3Helper_module', function () {
	describe('upload', function () {
		it("should upload file to s3", function (done) {
			var actual, expected, callback;
			expected = awsUrl + fileName;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.upload(filePath, callback);
		});
		it('should throw when file neme is not provided', function (done) {
			var callback = function (err, res) {
				assert.strictEqual(34, err.errno);
				assert.strictEqual("ENOENT", err.code);
				assert.strictEqual("", err.path);
				done();
			};
			sut.upload('', callback);
		});				
	});
	describe('uploadBuffer', function () {
		it("should upload a buffer to s3", function (done) {
			var buffer, s3Filename, actual, expected, callback;
			buffer = new Buffer('now is the time for all good men to come to the aid of their party');
			s3Filename = "uploaded_buffer.txt";
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				expected = awsUrl + s3Filename;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadBuffer(buffer, s3Filename, callback);
		});

	});
	describe('uploadStream', function () {
		it("should upload file to s3 from stream", function (done) {
			var stream  = fs.createReadStream(filePath),
				s3Filename = "sendingStream.png",
				expected = awsUrl + s3Filename,
				callback = function (err, res) {
					var actual = res.client._httpMessage.url;
					assert.strictEqual(200, res.statusCode);
					assert.strictEqual(actual, expected);
					done();
				};
				sut.uploadStream(stream, s3Filename, callback);
		});	
	});
	describe('uploadBufferForUser', function () {
		it("should upload buffer to s3 for user", function (done) {
			var buffer, s3Filename, actual, userId, expected, callback;
			buffer = new Buffer('now is the time for all good men to come to the aid of their party');
			s3Filename = "uploaded_buffer.txt";
			userId = '    bob     ';
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				expected = awsUrl + userId.trim() + '/' +  s3Filename;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadBufferForUser(buffer, s3Filename, userId, callback);
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
	describe('uploadForUser', function () {
		it("should notify if userid is undefined", function () {
			var userId, expected, callback;
			userId = undefined;
			expected = "UserId may not be empty";
			callback = function (err) {
				assert.strictEqual(err, expected);
			};
			sut.uploadForUser(filePath, userId, callback);
		});
		it("should notify if userid is whitespace", function () {
			var userId, expected, callback;
			userId = '        ';
			expected = "UserId may not be empty";
			callback = function (err) {
				assert.strictEqual(err, expected);
			};
			sut.uploadForUser(filePath, userId, callback);
		});	
		it("should add trimmed userId to storage name when provided and upload to s3", function (done) {
			var userId, actual, expected, callback;
			userId = '    bob     ';
			callback = function (err, res) {
				expected = 'https://philatopedia.s3.amazonaws.com/bob/home.css';
				expected = awsUrl + userId.trim() + '/' +  fileName;
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadForUser(filePath, userId, callback);
		});
	});

});