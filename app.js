const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open', function(){
    console.log('connected to MongoDB');
});

//check for db errors
db.on('error', function(err){
    console.log(err);
});

//init app
const app = express();

//bring in models
let Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true

}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//passport config
require('./config/passport')(passport);

 app.use(passport.initialize());
 app.use(passport.session());

 app.get('*', function(req, res, next){
   res.locals.user= req.user || null;
   next();
 });

//home route
app.get('/', function(req,res){
    Article.find({}, function(err, articles){

        if(err){
            console.log(err);
        } else {
            res.render('index', {
                title:'Articles',
                articles: articles

         });
        }
      });
  });

//rote files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//start server
app.listen(3000,function(){
    console.log('server started on port 30000...');
});
