"use strict";
exports.awsS3Helper = function (fs, mime, knox) {
	var S3_KEY = 'AKIAJX4OEAZEBFQXY4FA',
		S3_SECRET = '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',
        S3_BUCKET = 'philatopedia',
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
			healthCheck : function () {
				return {
					fs: fs,
					mime : mime,
					knox : knox
				};
			},
	        saveUserFile : function (userId, fileName, callback) {
	            var s3Filename, headers, req;
	            s3Filename = '/' + userId + '/' + fileName.substr(fileName.lastIndexOf('/') + 1);
	            fs.stat(fileName, function (err, stat) {
	                if (err) {
	                    throw err;
	                }
	                fs.readFile(fileName, function (err, buf) {
	                    var req;
	                    if (err) {
	                        throw err;
	                    }
	                    req = client.put(s3Filename, {
	                        'Content-Length': stat.size,
	                        'Content-Type': getContentType(fileName)
	                    });
	                    req.on('response', function (res) {
	                        if (callback) {
	                            callback(req, res);
	                        }
	                    });
	                    req.end(buf);
	                });
	            });
	        }
		};
	return that;
};

