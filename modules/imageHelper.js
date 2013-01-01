"use strict";
exports.imageHelper = function (imagemagick, spawn, Stream, fs) {
	var resizeFromStream, that, tempPath, doScaleTransform;
	imagemagick.identify.path = '/usr/bin/identify';
	imagemagick.convert.path = "/usr/bin/convert";
	tempPath = '/home/zurer/projects/awsS3ImageHelper/public/images/';
	resizeFromStream  =  function (inputStream, width, height, callback) {
		var command, args, proc, stream;
		args = ["-", "-resize", width + "x" + height, "-"];
		command = 'convert';
		proc = spawn(command, args);
		stream = new Stream();
		proc.stderr.on('data', stream.emit.bind(stream, 'error'));
		proc.stdout.on('data', stream.emit.bind(stream, 'data'));
		proc.stdout.on('end', stream.emit.bind(stream, 'end'));
		proc.on('error', stream.emit.bind(stream, 'error'));
		inputStream.pipe(proc.stdin);
		callback(stream);
	};
	doScaleTransform = function (width, height, size, callback) {
		if (width > height) {
			height = (height * size) / width;
			width = Math.min(size, width);
		} else {
			width = (width * size) / height;
			height = Math.min(size, height);
		}
		callback(width, height);
	};
	that = {
		getFileBytes : function (input) {
			var parseError, isInKilobytes, isInMegabytes, isInGigaBytes, numericPart, fileSize;
			parseError = "File size cannot be parsed [" + input  + "]";
			if (!input || input.trim().length < 3) {
				throw parseError;
			}
			input = input.toUpperCase();
			isInKilobytes = input.indexOf("KBB") !== -1;
			isInMegabytes = input.indexOf("MBB") !== -1;
			isInGigaBytes = input.indexOf("GBB") !== -1;
			numericPart = input.substr(0, input.length - 3);
			fileSize = Number(numericPart);
			if (isNaN(fileSize)) {
				throw parseError;
			}
			if (isInKilobytes) {
				return fileSize * 1000;
			}
			if (isInMegabytes) {
				return fileSize * 1000000;
			}
			if (isInGigaBytes) {
				return fileSize * 1000000000;
			}
			throw parseError;
		},
		getFeatures : function (filePath, callback) {
			imagemagick.identify(filePath, function (err, features) {
				if (err) {
					throw err;
				}
				callback(features);
			});
		},
		validateSize : function (filePath, limit, callback) {
			if (!limit || limit <= 0) {
				throw "Limit muxt be greater than zero";
			}
			that.getFeatures(filePath, function (features) {
				var fileSize = features.filesize,
					bytes = that.getFileBytes(fileSize),
					isTooBig = bytes > limit;
				if (callback) {
					callback(isTooBig, features);
				}
			});
		},
		resizeFromFile : function (filePath, size, callback) {
			var inputStream;
			that.getFeatures(filePath, function (features) {
				doScaleTransform(features.width, features.height, size, function (width, height) {
					inputStream = fs.createReadStream(filePath);
					resizeFromStream(inputStream, width, height, callback);
				});
			});
		},
		resizeFromUrl : function (url, size, callback) {
			var inputStream;
			that.getFeatures(url, function (features) {
				doScaleTransform(features.width, features.height, size, function (width, height) {
					inputStream = spawn('curl', [url]).stdout;
					resizeFromStream(inputStream, width, height, callback);
				});
			});
		}

	};
	return that;
};