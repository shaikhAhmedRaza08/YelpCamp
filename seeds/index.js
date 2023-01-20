const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connections Error:"));
db.once('open', () => {
    console.log("Database connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const city = new Campground({
            author: '63c833c6cc9fd892cf829b40',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, iste rerum! Possimus quas corrupti dolorum dolor reiciendis eaque asperiores aut! Ea libero ullam sunt a, nisi eligendi sint inventore suscipit?',
            price
        });
        await city.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});