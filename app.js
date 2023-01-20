const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate')
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const session = require('express-session')
const flash = require('connect-flash');
// const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// My own Middleware to Override HTTP Methods
const HTTPMethodOverrider = (req, res, next) => {
    const { _method } = req.query;
    if (_method && _method.toLowerCase() === 'put') req.method = _method;
    if (_method && _method.toLowerCase() === 'delete') req.method = _method;
    next();
}

const sessionConfig = {
    secret: 'moonisastar',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.engine('ejs', engine);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(methodOverride('_method'));
app.use(HTTPMethodOverrider);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(flash());
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connections Error:"));
db.once('open', () => {
    console.log("Database connected")
})

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/users', usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Sorry, Something went wrong!'
    res.status(statusCode);
    res.render('error', { err });
})

app.listen(3000, () => {
    console.log("Server listening on port 3000");
})