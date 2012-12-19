/*global  describe, beforeEach, afterEach, i, it*/
"use strict";
var assert = require('assert'), 
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	fs = require('fs'),
	spawn = require('child_process').spawn,
	Stream = require('stream'),
	imagemagick = require('imagemagick'),
	sut = require('../modules/imageHelper').imageHelper(imagemagick, spawn, Stream, fs);
describe('module_imageHelper', function () {
	it("getFeatures", function (done) {			
		var filePath = folderPath +  "file_to_copy.jpg",
			callback = function (features) {
				assert.strictEqual(features.format, 'JPEG')
				assert.strictEqual(features.width, 1600)
				assert.strictEqual(features.height, 1033)
				done();
			};
		sut.getFeatures(filePath, callback); 
	});
	it("resizeFromUrl should get an image from a url, resize and pipe it into a stream", function (done) {	
		var fileUrl = 'http://upload.wikimedia.org/wikipedia/commons/4/4f/Big%26Small_edit_1.jpg',
			streamOut = fs.createWriteStream(folderPath +  "resized_file.jpg"),
			callback = function (stream) {
				stream.pipe(streamOut);
				stream.on('end', function () {
					done();
				});
			};
		sut.resizeFromUrl(fileUrl, 30, callback); 
	});

});

