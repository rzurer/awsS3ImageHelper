"use strict";
exports.routes = function () {
    return {
        initialize : function (app, awsS3Helper) {
            app.get('/', function (req, res) {
                var dependencies = awsS3Helper.healthCheck();
                res.render('home', { healthCheck : dependencies});
            });
        }
    };
};
