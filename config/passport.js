const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = function(passport) {
    passport.use(new LocalStrategy(function(username, password, done) {
        User.findOne({ username: username }, (err, user) => {
            if (err) console.log(err);
            if (!user) { return done(null, false, { message: 'Usario no existe' }) }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) console.log(err);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Contraseña no válido' });
                }
            });
        });
    }));
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});