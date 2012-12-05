'use strict';
var local = true,
    application,
    express = require('express'),
    fs = require('fs'),
    jade = require('jade'),
	flash = require('connect-flash'),
	browserify = require('browserify'),
    routes = require('./modules/routes').routes(),
    config = require('./config'),
    knox = require('knox'),
    imagemagick = require('imagemagick'),
    common = require('../common/modules/common').common(),
    awsS3ImageHelper = require('./modules/awsS3ImageHelper').awsS3ImageHelper(common, knox, imagemagick),
    app = module.exports = express();
config.configure(app, express, flash);
routes.initialize(app, awsS3ImageHelper);
application = app.listen(3333);
if (local) {
    console.log('Express service listening on port %d, environment: %s', application.address().port, app.settings.env);
}