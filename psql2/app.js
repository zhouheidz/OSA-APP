var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'),
  	cons = require('consolidate');

var routes = require('./routes/index');
var session = require('client-sessions');

var app = express();

//Assign Dust Engine to .dust Files
app.engine('dust', cons.dust);

//Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

app.use('/', routes);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace


// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status( err.code || 500 )
//     .json({
//       status: 'error',
//       message: err
//     });
//   });
// }

// // // production error handler
// // // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500)
//   .json({
//     status: 'error',
//     message: err.message
//   });
// });


module.exports = app;
