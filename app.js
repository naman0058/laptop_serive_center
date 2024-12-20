var createError = require('http-errors');
const http = require('http');
var cookieSession = require('cookie-session')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var admin = require('./routes/admin');
var dataservice =require('./routes/dataservice')
var api = require('./routes/api');
const session = require('express-session');
const passport = require('passport');

const InstagramStrategy = require('passport-instagram'); 


var app = express();


app.use(cookieSession({
  name: 'session',
  keys: ['laptop_application_service_center'],
  resave: false,
    saveUninitialized: true,
    cookie: { secure: true },

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


// app.use(session({ 
//   secret: 'secretKey', // Change this to a more secure secret in production
//   resave: false, // Only resave if the session is modified
//   saveUninitialized: true // Save uninitialized sessions
// }));

// Passport initialization
// app.use(passport.initialize());
// app.use(passport.session());




// passport.use(new InstagramStrategy({
//   clientID: '441162705660684',
//   clientSecret: '93e025dd145211f8b34581b24b6e27a4',
//   callbackURL: "/auth/instagram/callback"
// },
// function(accessToken, refreshToken, profile, done) {
//   // const user = {
//   //   id: profile.id,
//   //   username: profile.displayName,
//   //   access_token: accessToken,
//   //   refresh_token: refreshToken,
//   //   profile: profile
//   // };
//   console.log('user details',accessToken)
//   console.log('user details',refreshToken)
//   console.log('user details',profile)


//   done(null, user);
// }));


// // Serialize and Deserialize User
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//   done(null, obj);
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',admin);
app.use('/admin/dashboard',dataservice);
app.use('/api/v1',api);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
