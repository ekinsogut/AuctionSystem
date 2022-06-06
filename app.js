const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer');

//-----------------------------------------------------

const app = express(); //Express

//-----------------------------------------------------

app.set('view engine', 'pug');
app.set('views', './views');

//-----------------------------------------------------

const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');

//-----------------------------------------------------

const User = require('./models/User');

//-----------------------------------------------------

require('dotenv').config(); //Dotenv
const ConnectString = process.env.ATLAS_URI; //Dotenv - .env

//-----------------------------------------------------

//Connect-mongodb-session
const store = new mongoDbStore({
  uri: ConnectString,
  collection: 'mySessions',
});

//-----------------------------------------------------

//Multer
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, './public/projectImages/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname) //Path
    );
  },
});

//-----------------------------------------------------

app.use(bodyParser.urlencoded({ extended: false })); //Bodyparser
app.use(multer({ storage: storage }).single('image')); //Multer
app.use(cookieParser()); //Cookieparser

//-----------------------------------------------------

//Express-session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
    store: store,
  })
);

//-----------------------------------------------------

app.use(express.static(path.join(__dirname, 'public'))); //Path

//-----------------------------------------------------

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

//-----------------------------------------------------

app.use(csurf()); //Csurf

//-----------------------------------------------------

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(accountRoutes);

//-----------------------------------------------------

//Mongoose
mongoose
  .connect(ConnectString)
  .then(() => {
    console.log('Database connection succeeded.');
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });

//-----------------------------------------------------
