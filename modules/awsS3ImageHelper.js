"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper) {
	var that = {
			uploadFromFile : function (filePath, widths, callback) {
				awsS3Helper.upload(filePath, callback);
			}

		};
	return that;
};

