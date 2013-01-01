"use strict";
exports.fileHelper = function (fs, http, https, url) {
	var tempPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
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
			}
		};
	return that;
};
