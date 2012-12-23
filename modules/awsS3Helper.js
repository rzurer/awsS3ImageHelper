"use strict";
exports.awsS3Helper = function (common, fs, mime, knox, fileHelper) {
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
        createS3FileName = function (userId, fileName) {
  			return userId && userId.trim().length > 0 ? userId.trim() + '/' + fileName : fileName;   	
        },
		that = {
			uploadFile : function (filePath, fileName, userId, callback) {
				var s3Filename;
				if ('function' == typeof userId) {
					callback = userId;
					userId = '';
				}			
				s3Filename = createS3FileName(userId, fileName);
				client.putFile(filePath, s3Filename, headers, function (err, res) { 
					if (callback) {
						callback(err, res);
					}
				});
			},
			uploadBuffer : function (buffer, fileName, userId, callback) {
				var s3Filename;
				if ('function' == typeof userId) {
					callback = userId;
					userId = '';
				}					
				s3Filename = createS3FileName(userId, fileName);
				client.putBuffer(buffer, s3Filename, headers, function (err, res) { 
					if (callback) {
						callback(err, res);
					}
				});
			},
			uploadStream : function (stream, fileName, userId, callback) {
				fileHelper.getBuffer(stream, function (buffer) {
					that.uploadBuffer(buffer, fileName, userId, callback);						
				});
			},
			download : function (fileName, callback) {	
				client.getFile(fileName, callback);
			},
			deleteFile : function (fileName, callback) {	
				client.deleteFile(fileName, callback);
			},
		};
	return that;
};

