"use strict";
exports.routes = function () {
    return {
        initialize : function (app, awsS3ImageHelper) {
            app.get('/', function (req, res) {
                res.render('home');
            });
        }
    };
};
