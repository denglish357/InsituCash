var express = require('express');
var path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const ejsLint = require('ejs-lint');
const session = require('express-session')

const MongoStore = require('connect-mongo')(session);

const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const passport = require('passport');
var dateFormat = require('dateformat');
var now = new Date();



// LOAD DOTENV
dotenv.config();

// DECLARE ENV VARIABLES
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const stripe = require('stripe')(stripePublicKey);

// MAKER SURE WE ARE ON LOCAL ENV THEN GET VARIABLES
if (process.env.NODE_ENV !== 'production') {
    const stripe = require('stripe')(stripeSecretKey);
}else{
  const stripe = require('stripe')(stripePublicKey);
}




var errorhandler = require('errorhandler');

if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorhandler())
}

// CONNECT TO MONGOOSE
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
let db = mongoose.connection;

// CHECK CONNECTION
db.once('open', (err) => {
  if(err){console.log(err)}
    console.log('Connected to mongodb');
});

// CHECK FOR DB ERRORS
db.on('err', err => {
    console.log(err);
});




// INIT APP
var app = express();





// LOAD VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
// SET VIEW ENGINE
app.set('view engine', 'ejs');
// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// SET GLOBAL ERRORS
app.locals.errors = null;





//EXPRESS FILE UPLOAD MIDDLEWARE
app.use(fileUpload());





// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection, ttl: 2 * 24 * 60 * 60})
}));

// PASSPORT CONFIG
require('./config/passport')(passport);

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

// EXPRESS MESSAGES MIDDLEWARE
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res)
    next();
});




// SET PORT
const port = process.env.PORT || 4000;

let Page = require('./models/page');
// GET ALL PAGES TO PASS TO HEADER.EJS
Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});
// GET CATEGORY MODEL
let Category = require('./models/category');
// GET ALL CATEGORIES TO PASS TO HEADER.EJS
Category.find(function(err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});
// BRING IN PRODUCTS ROUTER
let products = require('./routes/products');
// BRING IN PRODUCTS ROUTER
let cart = require('./routes/cart');
// BRING IN PRODUCTS ROUTER
let users = require('./routes/users');
// BRING IN PAGES ROUTER
let pages = require('./routes/pages');
let productoffs = require('./routes/productoffs')
// BRING IN ADMIN PAGES
let adminPages = require('./routes/admin_pages');
let adminProductoffs = require('./routes/admin_productoffs')
// BRING IN CATEGORIES PAGES
let adminCategories = require('./routes/admin_categories');
// BRING IN CATEGORIES PAGES
let adminProducts = require('./routes/admin_products');
// BRING IN CATEGORIES PAGES
let adminDeliveries = require('./routes/admin_deliveries');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/user/productoffs', productoffs)
app.use('/admin/products', adminProducts);
app.use('/admin/productoffs',adminProductoffs)
app.use('/admin/deliveries', adminDeliveries);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);


// START SERVER
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});