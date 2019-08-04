var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var stylus = require('stylus');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));


//form upload + email
var mongodb = require('mongodb');
var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017');
var mongodb = require('mongodb');
var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("comments", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});

app.post('/contact', function (req, res) {
    dbConn.then(function(db) {
        delete req.body._id; // for safety reasons
         var dbo = db.db("mydb");
         dbo.collection("comments").insertOne(req.body, function(err, res1) {
            if (err) throw err;
            console.log("1 document inserted");
          });    
          var num = dbo.collection("comments").countDocuments({}, function(err, res2) {

              if (err) throw err;
           
              var find = dbo.collection("comments").count({"email": req.body.email}, function(err, res3) {
               
                if (res3 < 2) {
                  res.send('Thank you! You have posted comment number: ' + res2);
                }

                else {
                  res.send('Welcome back! Your new feedback has been recorded!');
                }
            });
        });
    });


  const nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'emailforcs350@gmail.com',
      pass: 'thisismypassword!!!'
      }
  });
  var mailOptions = {
    from: 'emailforcs350@gmail.com',
  	to: req.body.email,
    subject: "Confirmation email",
    text: "Your comment has been submitted, thank you!"
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      }
  });
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
