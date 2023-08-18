const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const db = require('./db');
require('dotenv').config();
const { requireAuth, checkUser } = require('./middleware/authMIddleware')
//const jwt = require('jsonwebtoken');
const route = require('./routes/authRoutes')
const bodyParser = require('body-parser')
const methodOverride = require('method-override');

const app = express();


const PORT = process.env.PORT || 3000;

// middleware
app.use(cookieParser())
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.json());
//app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))





// view engine
app.set('view engine', 'ejs');

// routes
//app.get('*', checkUser)
app.get('/', requireAuth, (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, checkUser, (req, res) => res.render('smoothies'));
app.use("", route);



app.listen(PORT, (req, res) => {

  console.log(" listening ALREADY")
})