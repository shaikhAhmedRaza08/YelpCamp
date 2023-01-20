const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


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

module.exports.isAuthorized = async (req, res, next) => {
    const { id } = req.params;
    const campById = await Campground.findById(id);
    if (!campById.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to make changes!');
        return res.redirect(`/campgrounds/${id}`);
    }
    return next();
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to make changes!');
        return res.redirect(`/campgrounds/${id}`);
    }
    return next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(',');
        if (error) throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(',');
        if (error) throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
