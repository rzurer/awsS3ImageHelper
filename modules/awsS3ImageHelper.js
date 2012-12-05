"use strict";
exports.awsS3ImageHelper = function (common, knox, imagemagick) {
	var that = {
			heartbeat : function (callback) {
				if (callback) {
					callback(common.getCurrentDate());
				}
			}
		};
	return that;
};