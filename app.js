'use strict';
var local = true,
    application,
    express = require('express'),
    fs = require('fs'),
    mime = require('mime'),
    jade = require('jade'),
	flash = require('connect-flash'),
	browserify = require('browserify'),
    routes = require('./modules/routes').routes(),
    config = require('./config'),
    knox = require('knox'),
    imagemagick = require('imagemagick'),
    awsS3Helper = require('./modules/awsS3Helper').awsS3Helper(fs, mime, knox),
    imageHelper = require('./modules/imageHelper').imageHelper(imagemagick),
    awsS3ImageHelper = require('./modules/awsS3ImageHelper').awsS3ImageHelper(awsS3Helper, imageHelper),
    app = module.exports = express();
config.configure(app, express, flash);
routes.initialize(app, awsS3ImageHelper);
application = app.listen(3333);
if (local) {
    console.log('Express service listening on port %d, environment: %s', application.address().port, app.settings.env);
}