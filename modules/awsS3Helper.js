"use strict";
exports.awsS3Helper = function (common, fs, mime, knox, fileHelper) {
	var S3_KEY = 'AKIAJX4OEAZEBFQXY4FA',
		S3_SECRET = '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',
        S3_BUCKET = 'philatopedia',
        headers = { 'x-amz-acl': 'public-read', 'Content-Type': 'image/jpeg' },
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
			philatopediaUrl : function (fileName) {
				return "https://philatopedia.s3.amazonaws.com/" + fileName;
			},
			uploadFile : function (filePath, fileName, callback) {
				client.putFile(filePath, fileName, headers, function (err, res) {
					if (callback) {
						callback(err, res);
					}
				});
			},
			uploadBuffer : function (buffer, fileName, callback) {
				client.putBuffer(buffer, fileName, headers, function (err, res) {
					if (callback) {
						callback(err, res);
					}
				});
			},
			uploadStream : function (stream, fileName, callback) {
				fileHelper.getBuffer(stream, function (buffer) {
					that.uploadBuffer(buffer, fileName, callback);
				});
			},
			download : function (fileName, callback) {
				client.getFile(fileName, callback);
			},
			deleteFile : function (fileName, callback) {
				client.deleteFile(fileName, callback);
			},
			deleteFiles : function (fileNames, callback) {
				client.deleteMultiple(fileNames, callback);
			},
		};
	return that;
};

