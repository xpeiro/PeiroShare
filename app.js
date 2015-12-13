/*  App Modules Setup   */
const
	express = require('express'),
	app = express(),
	fs = require('fs'),
	http = require('http'),
	request = require('request'),
	compression = require('compression'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	validUrl = require('valid-url'),
	path = require('path'),
	MAX_HISTORY = 10;
/*
    Web Server Setup
*/
// Setup request compression (compress all)
app.use(compression());
// Set favicon
app.use(favicon(__dirname + '/public/images/favicon.svg'));
// Setup HTTP Request Logger (morgan).
app.use(logger('dev', {
	//do not log succesfull requests, only errors.
	skip: function(req, res) {
		return res.statusCode < 400
	}
}));
// Set static route directory to ./public
app.use(express.static(path.join(__dirname, 'public')));
//Setup 404 error handler (if no handler before this is called, url not found)
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
// Display error in html.
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send('<h1>Error: ' + err.status + '<br>' + err.message + '</h1>' +
		'<h3>Description: ' + req.url + ' was not found.</h3>');
});

var history = [];
var currentdate = new Date();

// start server
var httpServer = http.createServer(app);
io = require('socket.io')(httpServer),
	httpServer.listen(3000, function() {
		console.log('PeiroShare: Server ready and listening on Port ' + 3000);
	});

//socket io setup
io.on('connection', function(newsocket) {
	socket = newsocket;
	console.log('Connected at ' + Date());
	io.emit("newHistory", history);
	// log user disconnect
	socket.on('disconnect', function() {
		console.log('Disconnected at ' + Date());
	});

	function saveAndSend(newText) {
		if (history.length == MAX_HISTORY) {
			history.shift();
		};
		history.push(newText);
		io.emit("newHistory", history);
	}

	socket.on('newText', function(data) {
		var newText = data;
		if (validUrl.isHttpUri(newText)) {
			request(newText, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					var title;
					try {
						title = /<title>(.+)<\/title>/.exec(body)[1];
					} catch (e) {
						title = newText;
					};
					newText = "<a href='" + newText + "'>" + title + "</a>";
					saveAndSend(newText);
				}
			});
		} else {
			saveAndSend(newText);
		};

	});
	socket.on('clearHistory', function() {
		history = [];
		io.emit("newHistory", history);
	});
});