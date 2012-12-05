/*globals  $, window*/
"use strict";
var initializeModule = function () {
	var healthCheck = function (date) {
		$('.awsS3ImageHelperContainer').text(date);
	};
	$(function () {
		window.awsS3ImageHelper.heartbeat(healthCheck);
	});
};