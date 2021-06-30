const express = require('express')
const router = express.Router({ mergeParams: true })
const Campground = require('../models/campground')
const Review = require('../models/review')
const { reviewSchema } = require('../schema.js')
const ExpressError = require('../utils/ExpressError')
const { validateReview, isLoggedIn, isAuthor, isReviewAuthor } = require('../middleware')

const reviews = require('../controllers/reviews')

// push reviews
router.post('/', isLoggedIn, validateReview, reviews.createReview)

// delete reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.deleteReview)

module.exports = router