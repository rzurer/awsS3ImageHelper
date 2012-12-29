"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, options) {
	var awsUrl = "https://philatopedia.s3.amazonaws.com/",
		folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
		fs = require('fs'),
		that = {
			uploadFromFile : function (filePath, fileName, sizes, callback) {
				var validateSizeCallback, count, extension, featuresArray, uploadCallback;
				validateSizeCallback = function (isTooBig, features) {
					if (isTooBig) {
						callback("The maximum file size has been exceeded [" + options.maximumFileSize + "]");
						return;
					}
					extension = "." + features.format;
					count = 1;
					featuresArray = [];
					uploadCallback = function (tempFile, uploadFileName) {
						awsS3Helper.uploadFile(tempFile, uploadFileName, function (err, res) {
							if (err) {
								throw err;
							}
							if (res.statusCode === 200) {
								fs.unlink(tempFile);
								imageHelper.getFeatures(awsUrl + uploadFileName, function (features) {
									featuresArray.push(features);
									if (count === sizes.length) {
										callback(featuresArray);
										return;
									}
									count += 1;
								});
							}
						});
					};
					sizes.forEach(function (size) {
						var s3FileName = fileName + '_' + size + extension,
							tempFile = folderPath +  "resized_file_" + size,// + ".jpg",
							streamOut = fs.createWriteStream(tempFile);
						imageHelper.resizeFromFile(filePath, size, function (stream) {
							stream.pipe(streamOut);
							stream.on('end', function () {
								uploadCallback(tempFile, s3FileName);
							});
						});
					});
				};
				imageHelper.validateSize(filePath, options.maximumFileSize, validateSizeCallback);
			}
		};
	return that;
};

