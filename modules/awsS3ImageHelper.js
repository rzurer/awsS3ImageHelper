"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, options) {
	var fs = require('fs'),
		that = {
			uploadFromFile : function (filePath, fileName, widths, callback) {
				var validateSizeCallback;
				if ('function' !== typeof callback) {
					callback = widths;
					widths = [];
				}
				validateSizeCallback = function (fileIsTooBig) {
					if (fileIsTooBig) {
						callback("The maximum file size has been exceeded [" + options.maximumFileSize + "]");
						return;
					}
					if (!widths || widths.length === 0) {
						awsS3Helper.uploadFile(filePath, fileName, callback);
						return;
					}
					var count = 1;
					widths.forEach(function (width) {
						imageHelper.resizeFromFile(filePath, width, function (stream) {
							var cb = function (err, res) {
								if (res.statusCode === 200) {
									count += 1;
								}
								if (count === widths.length) {
									callback();
								}
							};
							awsS3Helper.uploadStream(stream, fileName + "_" + width + ".jpg", cb);
						});
					});
				};
				imageHelper.validateSize(filePath, options.maximumFileSize, validateSizeCallback);
			},
		};
	return that;
};

