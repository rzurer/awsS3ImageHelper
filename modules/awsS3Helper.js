"use strict";
exports.awsS3Helper = function (common, fs, mime, knox) {
	var S3_KEY = 'AKIAJX4OEAZEBFQXY4FA',
		S3_SECRET = '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',
        S3_BUCKET = 'philatopedia',
        headers = { 'x-amz-acl': 'public-read' },
        client = knox.createClient({
            key: S3_KEY,
            secret: S3_SECRET,
            bucket: S3_BUCKET
        }),
        getContentType = function (src) {
            var contentType, charset;
            contentType = mime.lookup(src);
            charset = mime.charsets.lookup(contentType);
            if (charset) {
                contentType += '; charset=' + charset;
            }
            return contentType;
        },
		that = {
			uploadForUser : function (filePath, userId, callback) {
				var err;
				if (common.isUndefinedOrWhitespace(userId)) {
					err = "UserId may not be empty";
					callback(err);
					return;
				}
				that.upload(filePath, callback, userId);

			},
			upload : function (filePath, callback, userId) {
				var fileName, s3Filename;
				fileName = common.getFileName(filePath);
				s3Filename = userId && userId.trim().length > 0 ? userId.trim() + '/' + fileName : fileName;
				client.putFile(filePath, s3Filename, headers, function (err, res) { //
					if (callback) {
						callback(err, res);
					}
				});
			},
			uploadBuffer : function (buffer, s3Filename, callback) {
				var fileName;
				client.putBuffer(buffer, s3Filename, headers, function (err, res) { //
					if (callback) {
						callback(err, res);
					}
				});
			},
			download : function (fileName, callback) {		
				client.getFile(fileName, callback);
			},
		};
	return that;
};

