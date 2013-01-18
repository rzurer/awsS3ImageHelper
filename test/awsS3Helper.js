/*global  describe, beforeEach, afterEach, it*/
"use strict";
var awsUrl = "https://philatopedia.s3.amazonaws.com/",
    folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	filePath = folderPath + "file_to_upload.png",
	s3fileName = "s3UploadedFile",
	expected = awsUrl + s3fileName,
	buffer = new Buffer('now is the time for all good men to come to the aid of their party'),
	Stream = require('stream'),
	expectedUserUrl = awsUrl,
	assert = require('assert'),
	http = require('http'),
	https = require('https'),
	url = require('url'),
    fs = require('fs'),
    mime = require('mime'),
	knox = require('knox'),
	common = require('../../common/modules/common').common(),
	fileHelper = require('../modules/fileHelper').fileHelper(fs, http, https, url),
	sut = require('../modules/awsS3Helper').awsS3Helper(common, fs, mime, knox, fileHelper);
describe("module_awsS3Helper", function () {
	describe('uploadFile and deleteFile', function () {
		it("should upload and delete a file from s3", function (done) {
			var actual, callback;
			callback = function (err, res) {
				assert.strictEqual(res.statusCode, 200);
				sut.download(s3fileName, function (err, res) {
					assert.strictEqual(res.statusCode, 200);
					sut.deleteFile(s3fileName, function (err, res) {
						assert.strictEqual(res.statusCode, 204);
						sut.download(s3fileName, function (err, res) {
							assert.strictEqual(res.statusCode, 404);
							done();
						});
					});
				});
			};
			sut.uploadFile(filePath, s3fileName, callback);
		});
		it('should throw when file path is not provided', function (done) {
			var callback = function (err, res) {
				assert.strictEqual(34, err.errno);
				assert.strictEqual("ENOENT", err.code);
				assert.strictEqual("", err.path);
				done();
			};
			sut.uploadFile('', s3fileName, callback);
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
		it("deleteFile should delete folder", function (done) {
			var folderName  = 'test/',
				fileOne  = folderName + s3fileName + 'One',
				fileTwo  = folderName + s3fileName + 'Two',
				downloadFolderCallback = function (err, res) {
					assert.strictEqual(res.statusCode, 404);
					done();
				},
				deleteCallbackTwo = function (err, res) {
					assert.strictEqual(res.statusCode, 204);
					sut.download(folderName, downloadFolderCallback);
				},
				deleteCallbackOne = function (err, res) {
					assert.strictEqual(res.statusCode, 204);
					sut.deleteFile(fileTwo, deleteCallbackTwo);
				},
				downloadCallbackTwo = function (err, res) {
					assert.strictEqual(res.statusCode, 200);
					sut.deleteFile(fileOne, deleteCallbackOne);
				},
				uploadCallbackTwo = function (err, res) {
					assert.strictEqual(res.statusCode, 200);
					sut.download(fileTwo, downloadCallbackTwo);
				},
				downloadCallbackOne = function (err, res) {
					assert.strictEqual(res.statusCode, 200);
					sut.uploadFile(filePath, fileTwo, uploadCallbackTwo);
				},
				uploadCallbackOne = function (err, res) {
					assert.strictEqual(res.statusCode, 200);
					sut.download(fileOne, downloadCallbackOne);
				};
			sut.uploadFile(filePath, fileOne, uploadCallbackOne);
		});
	});
	describe('uploadBuffer', function () {
		it("should upload a buffer to s3", function (done) {
			var actual,
				deleteCallback = function (err, res) {
					assert.strictEqual(204, res.statusCode);
					done();
				},
				callback = function (err, res) {
					actual = res.client._httpMessage.url;
					assert.strictEqual(200, res.statusCode);
					assert.strictEqual(actual, expected);
					sut.deleteFile(s3fileName, deleteCallback);
				};
			sut.uploadBuffer(buffer, s3fileName, callback);
		});
	});
	describe('uploadStream', function () {
		it("should upload file to s3 from stream", function (done) {
			var actual,
				stream  = fs.createReadStream(filePath),
				deleteCallback = function (err, res) {
					assert.strictEqual(204, res.statusCode);
					done();
				},
				callback = function (err, res) {
					var actual = res.client._httpMessage.url;
					assert.strictEqual(200, res.statusCode);
					assert.strictEqual(actual, expected);
					sut.deleteFile(s3fileName, deleteCallback);
				};
			sut.uploadStream(stream, s3fileName, callback);
		});
	});
});
