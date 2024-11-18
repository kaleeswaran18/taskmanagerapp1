var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var http = require('http'); // Import HTTP module
var { Server } = require('socket.io'); // Import Socket.IO
const cron = require("node-cron");
const model = require("./model");
const axios = require("axios");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { initializeSocket, userSockets } = require('./socket');
require('dotenv').config();

var app = express();
var server = http.createServer(app); // Create HTTP server
var io = initializeSocket(server); // Initialize Socket.IO with the server

// Attach the Socket.IO instance to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Set up middleware
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public/images')));

// Set up routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catch 404 errors
app.use(function (req, res, next) {
  next(createError(404));
});

// Cron job
if (process.env.NODE_ENV !== "test") {
  console.log('cornjob run')
cron.schedule("0 10-20 * * *", async () => {
  try {
    const response = await axios.get("http://localhost:7000/users/getalltask");
    response.data.data.forEach((element) => {
      const userId = element.assignedUser._id;
      if (userSockets[userId]) {
        io.to(userSockets[userId]).emit('newcornjob', element);
        console.log(`Emitted to user: ${userId}`, element);
      } else {
        console.warn(`No socket connection found for user: ${userId}`);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
});
}
// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Export both app and server for testing
module.exports = { app, server };
