"use strict";
exports.fileHelper = function (tempPath) {
	var fs = require("fs"),
		http = require("http"),
		https = require("https"),
		url = require("url"),
		that = {
			wantSecureTransport : function (inputUrl) {
				return url.parse(inputUrl).protocol === 'https:';
			},
			saveFromFile : function (inputPath, outputPath, callback) {
				var readStream, writeStream;
				readStream = fs.createReadStream(inputPath);
				writeStream = fs.createWriteStream(outputPath);
				readStream.on('data', function (data) {
					writeStream.write(data);
				});
				readStream.on('close', function () {
					writeStream.end();
					if (callback) {
						callback();
					}
				});
			},
			createTempNamedStream : function () {
				var tempFile = tempPath +  new Date().getTime(),
					streamOut = fs.createWriteStream(tempFile);
				return { stream : streamOut, fileName : tempFile};
			},
			deleteTempFile : function (tempFile) {
				fs.unlink(tempFile);
			},
			getUrlStream : function (inputUrl, callback) {
				if (that.wantSecureTransport(inputUrl)) {
					https.get(inputUrl, callback);
					return;
				}
				http.get(inputUrl, callback);
			},
			saveFromUrl : function (inputUrl, outputPath, callback) {
				var writeStream, saveCallback, request;
				writeStream = fs.createWriteStream(outputPath);
				saveCallback = function (response) {
					response.pipe(writeStream);
					if (callback) {
						callback();
					}
				};
				if (that.wantSecureTransport(inputUrl)) {
					https.get(inputUrl, saveCallback);
					return;
				}
				http.get(inputUrl, saveCallback);
			},
			getBuffer : function (stream, callback) {
				var buffer;
				stream.on('data', function (data) {
					buffer = data;
				});
				stream.on('end', function () {
					if (callback) {
						callback(buffer);
					}
				});
			},
			getFileSizeFromUrl : function (fileUrl, callback) {
				var size, parsed, options, req;
				parsed = url.parse(fileUrl);
				options = {method: 'HEAD', host: parsed.host, path: parsed.path};
				req = http.request(options);
				req.on('response', function (res) {
					size = Number(res.headers['content-length']);
					callback(size);
				});
				req.end();
			},
			getFileSizeFromFile : function (filePath, callback) {
				fs.stat(filePath, function (err, stats) {
					if (err) {
						throw err;
					}
					callback(stats.size);
				});
			}
		};
	return that;
};
