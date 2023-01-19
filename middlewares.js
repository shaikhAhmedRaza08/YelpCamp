module.exports.isLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated() || !req.isAuthenticated) {
        if (req.session) {
            req.session.returnTo = req.originalUrl;
        }
        req.flash('error', 'You must be logged in!');
        return res.redirect('/users/login');
    } else {
        return next();
    }
}