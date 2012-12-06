"use strict";
exports.awsS3ImageHelper = function (awsS3Helper, imageHelper) {
	var that = {
			healthCheck : function () {
				return {
					awsS3Helper: awsS3Helper.healthCheck(),
					imageHelper : imageHelper.healthCheck()
				};
			}
		};
	return that;
};

