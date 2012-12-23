"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper, options) {

	var that = {
			uploadFromFile : function (filePath, fileName, callback) {
				var fileIsTooBigCallback = function (fileIsTooBig) {
					if (fileIsTooBig) {
						callback("The maximum file size has been exceeded [" + options.maximumFileSize + "]");
						return;
					}
					awsS3Helper.uploadFile(filePath, fileName, callback)
				}
				imageHelper.fileIsTooBig(filePath, options.maximumFileSize, fileIsTooBigCallback);
			},
		};
	return that;
};

