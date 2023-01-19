const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthorized, validateCampground } = require('../middlewares');
const campgroundsController = require('../controllers/campgroundsController')

router.get('/', catchAsync(campgroundsController.index));

router.get('/new', isLoggedIn, catchAsync(campgroundsController.renderNewForm));

router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundsController.createCampground));

router.get('/:id', catchAsync(campgroundsController.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(campgroundsController.renderEditForm));

router.put('/:id', isLoggedIn, isAuthorized, validateCampground, catchAsync(campgroundsController.updateCampground));

router.delete('/:id', isLoggedIn, isAuthorized, catchAsync(campgroundsController.deleteCampground));


module.exports = router;