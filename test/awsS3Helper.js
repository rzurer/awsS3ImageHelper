/*global  describe, beforeEach, afterEach, it*/
"use strict";
var awsUrl = "https://philatopedia.s3.amazonaws.com/",
	locaUrl = "/home/zurer/projects/awsS3ImageHelper/public/images/",
	fileName = "HingedStamp.png",
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
			var filePath, actual, expected, callback;
			filePath = locaUrl + fileName;
			expected = awsUrl + fileName;
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.upload(filePath, callback);
		});
		it("should upload file to s3 using buffer", function (done) {
			var filePath, actual, expected, callback;
			filePath = locaUrl + fileName;
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
		it("should upload file to s3", function (done) {
			var buffer, fileName, actual, expected, callback;
			buffer = new Buffer('now is the time for all good men to come to the aid of their party');
			fileName = "now_is_the_time.txt";
			callback = function (err, res) {
				actual = res.client._httpMessage.url;
				expected = awsUrl + fileName;
				assert.strictEqual(200, res.statusCode);
				assert.strictEqual(actual, expected);
				done();
			};
			sut.uploadBuffer(buffer, fileName, callback);
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
			var filePath, userId, expected, callback;
			filePath = locaUrl + fileName;
			userId = undefined;
			expected = "UserId may not be empty";
			callback = function (err) {
				assert.strictEqual(err, expected);
			};
			sut.uploadForUser(filePath, userId, callback);
		});
		it("should notify if userid is whitespace", function () {
			var filePath, userId, expected, callback;
			filePath = locaUrl + fileName;
			userId = '        ';
			expected = "UserId may not be empty";
			callback = function (err) {
				assert.strictEqual(err, expected);
			};
			sut.uploadForUser(filePath, userId, callback);
		});	
		it("should add trimmed userId to storage name when provided", function (done) {
			var filePath, userId, actual, expected, callback;
			filePath = locaUrl + fileName;
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

    

/*
var fs = require('fs'), filename, buffer, userId, callback, writeCb;
filename = '../misc/now_is_the_time.txt';
buffer = new Buffer('now is the time for all good men to come to the aid of their party');
userId = 'bob';
callback = function (err, req, res) {
	console.log('callback ', err);
};
writeCb = function (err) {
	console.log('writeCb');
	if (err) {
		throw err;
	}
	sut.saveUserFile(userId, filename, callback);
};
fs.writeFile(filename, buffer, writeCb);

*/