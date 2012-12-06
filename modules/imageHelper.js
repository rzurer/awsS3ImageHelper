"use strict";
exports.imageHelper = function (imagemagick) {
	var	that = {
		healthCheck : function () {
			return {
				imagemagick: imagemagick
			};
		},
	};
	return that;
};