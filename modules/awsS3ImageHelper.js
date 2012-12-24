"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, options) {
	var fs = require('fs'),
		that = {
			uploadFromFile : function (filePath, fileName, widths, callback) { 
				if ('function' == typeof widths) {
					callback = widths;
				}	
				var validateSizeCallback = function (fileIsTooBig) {
					if (fileIsTooBig) {
						callback("The maximum file size has been exceeded [" + options.maximumFileSize + "]");
						return;
					}
					if (!widths || widths.length === 0) {
						awsS3Helper.uploadFile(filePath, fileName, callback)
						return;
					}
					widths.forEach(function (width) {
						imageHelper.resizeFromFile(filePath, width, function (stream) {
							awsS3Helper.uploadStream(stream, "the_test_" + width + ".jpg");							
						});								
					});
				}
				imageHelper.validateSize(filePath, options.maximumFileSize, validateSizeCallback);
			},
		};
	return that;
};

