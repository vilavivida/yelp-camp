
// if we are in development form, require the dotenv:
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const { storage } = require('../cloudinary')

// for image upload
const multer = require('multer')
// here dest is the path where the file will be stored.
const upload = multer({ storage })

// import controllers
const campgrounds = require('../controllers/campgrounds')

// import middlewares
const { isLoggedIn, validateCampground, isAuthor, isReviewAuthor } = require('../middleware')

// Error-Handling function
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

router.route('/')
    // to create a new instance, it takes two routes
    // a get request to access new form.ejs
    // a post request to post the new instance to campgrounds
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, campgrounds.createCampground)

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    // independent page for each campground
    .get(campgrounds.showCampground)
    // Update: faking put request through override
    // "image" is the input id from the ejs file
    .put(isLoggedIn, isAuthor, upload.array('image'), campgrounds.updateCampground)
    // Delete: also fake it through override
    .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground)

// edit & update
router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm)

module.exports = router