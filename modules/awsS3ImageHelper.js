"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, fileHelper, options) {
	var Emitter = require('events').EventEmitter,
		emitter = new Emitter(),
		defaultThumbnailWidths = [300, 30],
		defaultMaximumFileSize =  200000,
		defaultNamingStrategy = function (format, width) {
			var time = String(new Date().getTime()),
				extension = "." + format;
			return width ? time + '_' + width + extension : time + extension;
		},
		maximumFileSize = (options && options.maximumFileSize) || defaultMaximumFileSize,
		thumbnailWidths = (options && options.thumbnailWidths) || defaultThumbnailWidths,
		namingStrategy = (options && options.namingStrategy) || defaultNamingStrategy,
		featuresArray = [],
		count = 1,
		addToFeaturesArrayAndReturnWhenComplete = function (features, url, s3FileName) {
			featuresArray.push({
				url : url,
				s3FileName : s3FileName,
				width : features.width,
				height : features.height
			});
			if (count === thumbnailWidths.length) {
				emitter.emit("end", featuresArray);
				emitter.removeListener("uploaded", fileHelper.deleteTempFile);
				return;
			}
			count += 1;
		},
		getFeaturesOfUploadedFile = function (err, res, tempFilename, features, url, s3FileName) {
			if (err) {
				throw err;
			}
			if (res.statusCode === 200) {
				emitter.emit("uploaded", tempFilename);
				imageHelper.getFeatures(url, function () {
					addToFeaturesArrayAndReturnWhenComplete(features, url, s3FileName);
				});
			}
		},
		uploadFileToS3 = function (stream, s3FileName, features, url) {
			var tempNamedStream = fileHelper.createTempNamedStream();
			stream.pipe(tempNamedStream.stream);
			stream.on('end', function () {
				awsS3Helper.uploadFile(tempNamedStream.fileName, s3FileName, function (err, res) {
					getFeaturesOfUploadedFile(err, res, tempNamedStream.fileName, features, url, s3FileName);
				});
			});
		},
		createThumbnailFromFile = function (imageFormat, width, filePath, features) {
			var s3FileName = namingStrategy(imageFormat, width),
				url = awsS3Helper.philatopediaUrl(s3FileName);
			imageHelper.resizeFromFile(filePath, width, function (stream) {
				uploadFileToS3(stream, s3FileName, features, url);
			});
		},
		createThumbnailFromUrl = function (imageFormat, width, fileUrl, features) {
			var s3FileName = namingStrategy(imageFormat, width),
				url = awsS3Helper.philatopediaUrl(s3FileName);
			imageHelper.resizeFromUrl(fileUrl, width, function (stream) {
				uploadFileToS3(stream, s3FileName, features, url);
			});
		},
		createSizeLimitExceededError = function (actualSize) {
			return "The maximum file size has been exceeded [Maximum File Size:" + maximumFileSize + " Actual Size:" + actualSize + "]";
		};
	return {
		on : function (event, listener) {
			emitter.on(event, listener);
		},
		once : function (event, listener) {
			emitter.once(event, listener);
		},
		uploadFromFile : function (filePath) {
			fileHelper.getFileSizeFromFile(filePath, function (size) {
				if (size > maximumFileSize) {
					emitter.emit("error", createSizeLimitExceededError(size));
					return;
				}
				emitter.on("uploaded", fileHelper.deleteTempFile);
				imageHelper.getFeatures(filePath, function (features) {
					thumbnailWidths.push(features.width);
					thumbnailWidths.forEach(function (width) {
						createThumbnailFromFile(features.format, width, filePath, features);
					});
				});
			});
		},
		uploadFromUrl : function (url) {
			fileHelper.getFileSizeFromUrl(url, function (size) {
				if (size > maximumFileSize) {
					emitter.emit("error",  createSizeLimitExceededError(size));
					return;
				}
				emitter.on("uploaded", fileHelper.deleteTempFile);
				imageHelper.getFeatures(url, function (features) {
					thumbnailWidths.push(features.width);
					thumbnailWidths.forEach(function (width) {
						createThumbnailFromUrl(features.format, width, url, features);
					});
				});
			});
		}
	};
};

