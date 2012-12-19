/*global  describe, beforeEach, afterEach, i, it*/
"use strict";
var assert = require('assert'), 
	folderPath = '/home/zurer/projects/awsS3ImageHelper/public/images/',
	fs = require('fs'),
	url = require('url'),
	http = require('http'),
	https = require('https'),
	sut = require('../modules/fileHelper').fileHelper(fs, http, https, url);
describe('module_fileHelper', function () {
	it("saveFromFile should copy a file on disk ", function (done) {			
		var inputPath = folderPath +  "file_to_copy.jpg",
			outputPath = folderPath +  "copied_file.jpg";
		sut.saveFromFile(inputPath, outputPath, function () { done(); }); 
	});
	it("saveFromUrl should save a file from a url to disk", function (done) {			
		var inputUrl = "https://s3.amazonaws.com/philatopedia/HingedStamp.png",
			outputPath= folderPath +  "downloaded_file.png";
		sut.saveFromUrl(inputUrl, outputPath, function () { done(); }); 
	});
});