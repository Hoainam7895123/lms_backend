const passport = require("passport");
const configureGoogleStrategy = require("./googleStrategy");

module.exports = (app, PORT) => {
    app.use(passport.initialize());
    app.use(passport.session());

    configureGoogleStrategy(passport, PORT);

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
