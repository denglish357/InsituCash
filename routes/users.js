var express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
let User = require('../models/user');
const { check, validationResult } = require('express-validator');


// GET HOME PAGE
router.get('/register', (req, res) => {
    res.render('register', {
        title: "Registrate"
    });
});

// GET REGISTER
router.post('/register', [
    check('name', 'Name is required').isLength({ min: 1 }),
    check('email', 'Email is required').isLength({ min: 1 }),
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is required').isLength({ min: 1 }),
    check('password', 'Password is required').isLength({ min: 1 })
    .exists()
    .withMessage('Password should not be empty, minimum eight characters, at least one letter, one number and one special character')
    .isLength({ min: 8 })
    .withMessage('Password should not be empty, minimum eight characters, at least one letter, one number and one special character')
    .matches(`^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$`)
    .withMessage('Password should not be empty, minimum eight characters, at least one letter and one number'),
    check('password2', 'Passwords dont match').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passords dont match dude');
        } else {
            return true
        }
    })
], (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.array(),
            title: "Register",
            user: null
        });
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (err) console.log(err);
            if (user) {
                req.flash('danger', 'user already exist');
                res.redirect('/users/register');
            } else {
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) console.log(err);
                        user.password = hash;
                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'you are now registered');
                                res.redirect('/login');
                            }
                        });
                    });
                });
            }
        });
    }
});



// GET LOGIN
router.get('/login', (req, res) => {
    if (res.locals.user) res.redirect('/');
    res.render('login', {
        title: 'Login'
    });
});

// POST LOGIN
router.post('/login', (req, res, next) => {
   passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// POST LOGOUT
router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success you are logged out');
    res.redirect('/users/login');
});




module.exports = router;