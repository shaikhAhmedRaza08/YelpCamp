const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate')
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas');
// const methodOverride = require('method-override');



// My own Middleware to Override HTTP Methods
const HTTPMethodOverrider = (req, res, next) => {
    const { _method } = req.query;
    if (_method && _method.toLowerCase() === 'put') req.method = _method;
    if (_method && _method.toLowerCase() === 'delete') req.method = _method;
    next();
}

app.engine('ejs', engine);
app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));
app.use(HTTPMethodOverrider);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connections Error:"));
db.once('open', () => {
    console.log("Database connected")
})


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    const msg = error.details.map(err => err.message).join(',');
    if (error) throw new ExpressError(msg, 400);
    next();
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', catchAsync((req, res) => {
    res.render('campgrounds/new');
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

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