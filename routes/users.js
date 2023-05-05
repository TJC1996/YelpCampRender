const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash : true, failureRedirect: '/login'}), users.login);




// console.log(registeredUser);
    

router.get('/logout', users.logout); 

module.exports = router;


