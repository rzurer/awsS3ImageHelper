"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, fileHelper, emitter, options) {
	var defaultThumbnailWidths = [300, 30],
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
		foo = function (features, url, s3FileName) {
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
		bar = function (err, res, tempFilename, features, url, s3FileName) {
			if (err) {
				throw err;
			}
			if (res.statusCode === 200) {
				emitter.emit("uploaded", tempFilename);
				imageHelper.getFeatures(url, function () {
					foo(features, url, s3FileName);
				});
			}
		},
		baz = function (stream, s3FileName, features, url) {
			var tempNamedStream = fileHelper.createTempNamedStream();
			stream.pipe(tempNamedStream.stream);
			stream.on('end', function () {
				awsS3Helper.uploadFile(tempNamedStream.fileName, s3FileName, function (err, res) {
					bar(err, res, tempNamedStream.fileName, features, url, s3FileName);
				});
			});
		},
		createThumbnail = function (imageFormat, width, filePath, features) {
			var s3FileName = namingStrategy(imageFormat, width),
				url = awsS3Helper.philatopediaUrl(s3FileName);
			imageHelper.resizeFromFile(filePath, width, function (stream) {
				baz(stream, s3FileName, features, url);
			});
		},
		validateSizeCallback = function (isTooBig, features, filePath) {
			if (isTooBig) {
				emitter.emit("error", "The maximum file size has been exceeded [" + maximumFileSize + "]");
				return;
			}
			emitter.on("uploaded", fileHelper.deleteTempFile);
			thumbnailWidths.push(features.width);
			thumbnailWidths.forEach(function (width) {
				createThumbnail(features.format, width, filePath, features);
			});
		};
	return {
		on : function (event, listener) {
			emitter.on(event, listener);
		},
		uploadFromFile : function (filePath) {
			imageHelper.validateSize(filePath, maximumFileSize, function (isTooBig, features) {
				validateSizeCallback(isTooBig, features, filePath);
			});
		}
	};
};

