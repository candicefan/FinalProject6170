var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var webpackDevHelper = require('./hotReload.js');
var promise = require("bluebird");

// Require routes.
var user = require('./routes/user');
var babbles = require('./routes/babbles');
var comments = require('./routes/comments')

var Utils = require('./utils/utils');
var User = require('./models/User');

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || process.env.MONGOHQ_URL || 
                 process.env.MONGOLAB_URI || 'mongodb://localhost/mymongodb'); 
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("database connected");
});

var app = express();

// Set up webpack-hot-middleware for development, express-static for production
if(process.env.NODE_ENV !== 'production') {
  console.log("DEVELOPMENT: Turning on WebPack middleware...");
  app = webpackDevHelper.useWebpackMiddleware(app);
  app.use('/css', express.static(path.join(__dirname, './public/css')));
  app.use('/img', express.static(path.join(__dirname, './public/img')));
} else {
  console.log("PRODUCTION: Serving static files from /public...");
  app.use(express.static(path.join(__dirname, './public')));
}

// Set up some middleware to use.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
  Enforce Single Origin Policy. 
*/
app.use(function(req, res, next) {
  if(req.headers['referer'] && !req.headers['referer'].startsWith(process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://maga-finalproject.herokuapp.com')) {
    Utils.sendErrorResponse(res, 403, 'Forbidden');
  } else {
    next();
  }
});

/*
  Accept only application/json for POST requests. 
*/
app.use(function(req, res, next) {
  if(req.method === 'POST') {
    if(! req.headers['accept'] === 'application/json') {
      Utils.sendErrorResponse(res, 403, 'Forbidden');
    } else {
      next();
    }
  } else {
    next();
  }
});

app.use(cookieParser());
app.use(session({ secret : '6170', resave : true, saveUninitialized : true, rolling: true, cookie: { maxAge: 1800000 } }));

// Authentication middleware. This function
// is called on _every_ request and populates
// the req.currentUser field with the logged-in
// user object based off thae kerberos provided
// in the session variable (accessed by the
// encrypted cookied).
// Same as example notes app. Many thanks and appreciates.
app.use(function(req, res, next) {
  if (req.session.kerberos) {
    User.getUser(req.session.kerberos).then(function(result) {
      if(result) {
        req.currentUser = {_id: result._id, kerberos: result.kerberos, name: result.name, babbleLimit: result.babbleLimit};
      }
      next();
    })
  } else {
    next();
  }
});

// Set up our routes.
app.use('/user', user);
app.use('/babbles', babbles);
app.use('/comments', comments)
app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, './public/index.html'))
});


// Export our app (so that bin can find it)
module.exports = app;