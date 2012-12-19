"use strict";
exports.fileHelper = function (fs, http, https, url) {
	var that = {
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
			}
		};
	return that;
};
