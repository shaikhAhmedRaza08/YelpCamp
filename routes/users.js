const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const usersController = require('../controllers/usersController');


router.get('/register', usersController.renderRegister);

router.post('/register', catchAsync(usersController.regiter));


router.get('/login', usersController.renderLogin);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login' }), usersController.login);

router.get('/logout', usersController.logout);

module.exports = router;