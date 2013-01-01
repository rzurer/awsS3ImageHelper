"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, fileHelper, events, options) {
	var emitter = new events.EventEmitter();
	return {
		on : function (event, listener) {
			emitter.on(event, listener);
		},
		uploadFromFile : function (filePath, fileName, sizes) {
			var featuresArray = [],
				count = 1,
				uploadToS3 = function (tempFileName, s3FileName) {
					awsS3Helper.uploadFile(tempFileName, s3FileName, function (err, res) {
						if (err) {
							throw err;
						}
						if (res.statusCode === 200) {
							emitter.emit("uploaded", tempFileName);
							imageHelper.getFeatures(awsS3Helper.philatopediaUrl(s3FileName), function (features) {
								featuresArray.push(features);
								if (count === sizes.length) {
									emitter.emit("end", featuresArray);
									return;
								}
								count += 1;
							});
						}
					});
				},
				resize = function (s3FileName, size) {
					var temp = fileHelper.createTempNamedStream();
					emitter.on("uploaded", fileHelper.deleteTempFile);
					imageHelper.resizeFromFile(filePath, size, function (stream) {
						stream.pipe(temp.stream);
						stream.on('end', function () {
							uploadToS3(temp.fileName, s3FileName);
						});
					});
				},
				validateSizeCallback = function (isTooBig, features) {
					if (isTooBig) {
						emitter.emit("error", "The maximum file size has been exceeded [" + options.maximumFileSize + "]");
						return;
					}
					sizes.forEach(function (size) {
						var s3FileName = fileName + '_' + size + "." + features.format;
						resize(s3FileName, size);
					});
				};
			imageHelper.validateSize(filePath, options.maximumFileSize, validateSizeCallback);
		}
	};
};

