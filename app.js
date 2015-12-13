/*  App Modules Setup   */
const
    express = require('express'),
    app = express(),
    fs = require('fs'),
    https = require('https'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    path = require('path');
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
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
io = require('socket.io')(httpsServer),
httpsServer.listen(3000, function() {
    console.log('PeiroShare: Server ready and listening on Port ' + 3000);
});

//socket io setup
io.on('connection', function(newsocket) {
    socket = newsocket;
    currentdate = new Date();
    console.log('Connected at ' + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
    // log user disconnect
    socket.on('disconnect', function() {
    	currentdate = new Date();
    	console.log('Disconnected at ' + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
    });
    socket.on('newText', function(data) {
    	if (history.length == 5) {
    		history.shift();
    	};
        history.push(data);
        console.log(history);
        socket.emit("newHistory", history);
    });
});
