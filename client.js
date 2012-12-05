/*jslint browser: true*/
/*global  window, localStorage, $*/
"use strict";
	var initialize = function () {
		var common = require('../common/modules/common').common(),
			awsS3ImageHelper = require('./modules/awsS3ImageHelper').awsS3ImageHelper(common);
			window.awsS3ImageHelper = awsS3ImageHelper;
	};
initialize();

