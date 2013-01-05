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
		namingStrategy = (options && options.namingStrategy) || defaultNamingStrategy;
	return {
		on : function (event, listener) {
			emitter.on(event, listener);
		},
		uploadFromFile : function (filePath) {
			var featuresArray = [],
				imageFormat,
				count = 1,
				validateSizeCallback = function (isTooBig, features) {
					var createThumbnail = function (width) {
						var s3FileName = namingStrategy(imageFormat, width),
							url = awsS3Helper.philatopediaUrl(s3FileName);
						imageHelper.resizeFromFile(filePath, width, function (stream) {
							var tempNamedStream = fileHelper.createTempNamedStream();
							stream.pipe(tempNamedStream.stream);
							stream.on('end', function () {
								awsS3Helper.uploadFile(tempNamedStream.fileName, s3FileName, function (err, res) {
									if (err) {
										throw err;
									}
									if (res.statusCode === 200) {
										emitter.emit("uploaded", tempNamedStream.fileName);
										imageHelper.getFeatures(url, function (features) {
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
										});
									}
								});
							});
						});
					};
					if (isTooBig) {
						emitter.emit("error", "The maximum file size has been exceeded [" + maximumFileSize + "]");
						return;
					}
					imageFormat = features.format;
					emitter.on("uploaded", fileHelper.deleteTempFile);
					thumbnailWidths.push(features.width);
					thumbnailWidths.forEach(createThumbnail);
				};
			imageHelper.validateSize(filePath, maximumFileSize, validateSizeCallback);
		}
	};
};

