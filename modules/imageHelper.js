"use strict";
exports.imageHelper = function (imagemagick, spawn, Stream, fs) {
	var resizeFromStream;
	imagemagick.identify.path = '/usr/bin/identify';
	imagemagick.convert.path = "/usr/bin/convert";
	resizeFromStream  =  function (inputStream, width, callback) {
		var command, args, proc, stream;
		args = ["-", "-resize", width + "x", "-"];
		command = 'convert';
		proc = spawn(command, args);
		stream = new Stream();
		proc.stderr.on('data', stream.emit.bind(stream, 'error'));
		proc.stdout.on('data', stream.emit.bind(stream, 'data'));
		proc.stdout.on('end', stream.emit.bind(stream, 'end'));
		proc.on('error', stream.emit.bind(stream, 'error'));
		inputStream.pipe(proc.stdin);
		callback(stream);
	};
	return {
		resizeFromFile : function (filePath, width, callback) {
			var inputStream = fs.createReadStream(filePath);
			resizeFromStream(inputStream, width, callback);
		},
		resizeFromUrl : function (url, width, callback) {
			var  inputStream = spawn('curl', [url]).stdout;
			resizeFromStream(inputStream, width, callback);
		},
		getFeatures : function (fileName, callback) {
			imagemagick.identify(fileName, function (err, features) {
				if (err) {
					throw err;
				}
				callback(features);
			});
		},
	};
};