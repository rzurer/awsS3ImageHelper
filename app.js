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
    app = module.exports = express();
config.configure(app, express, flash, browserify);
routes.initialize(app);
application = app.listen(3333);
if (local) {
    console.log('Express service listening on port %d, environment: %s', application.address().port, app.settings.env);
}