const express = require('express')
const router = express.Router()
const passport = require('passport')
const { isLoggedIn } = require('../middleware')

const users = require('../controllers/users')

router.route('/register')
    // registration route
    .get(users.renderRegister)
    .post(users.register)


// LogIn routes
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// You have to sign in to create new campground
router.get('/new', isLoggedIn, users.loginNew)

// LogOut
router.get('/logout', users.logout)

module.exports = router