var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var logger = require('morgan');
var debug = require('debug')('volavote2:server');
var http = require('http');
require('dotenv').config()

if(!process.env.ADMIN_NAME){
  process.env.ADMIN_NAME='vvadmin'
}
if(!process.env.ADMIN_PASSWORD){
  process.env.ADMIN_PASSWORD='vvpassword'
}
if(!process.env.ANONIMOUS_CREATE){
  process.env.ANONIMOUS_CREATE='false'
}
if(!process.env.REQUIRE_CODE){
  process.env.REQUIRE_CODE='false'
}
if(!process.env.REQUIRE_NAME){
  process.env.REQUIRE_NAME='false'
}
if(!process.env.POLL_CODE){
  process.env.POLL_CODE=''
}

var app = express();
app.use(session({
  secret: 'keyboard lion',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Socket.IO server & Router
 */
var io = require('socket.io')(server)
var socketio = require('./modules/volavoteSocketIo')
socketio(io)

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin')(io);
var parentRouter= require('./routes/parent')(io);
var usersRouter = require('./routes/users');
var apiRouter   = require('./routes/api')(io);
var pollRouter  = require('./routes/poll')(io);
var quizRouter  = require('./routes/quiz')

app.use('/', indexRouter);
app.use('/admin',adminRouter);
app.use('/users', usersRouter);
app.use('/api',apiRouter);
app.use('/poll',pollRouter);
app.use('/parent',parentRouter);
app.use('/quiz',quizRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  //console.log(err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.render('poll/nopoll',{title:'volavote'})

});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '80');
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
