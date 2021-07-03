const Campground = require('../models/campground')
const Review = require('../models/review')

// Error-Handling function
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

module.exports.createReview = wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    const review = new Review(req.body.review)
    review.author = req.user._id
    review.campground = campground
    // save review
    await review.save()
    // calculate average rating
    campground.reviews.push(review)
    var sum = 0
    campground.reviews.forEach(function (item) {
        sum += item.rating;
    });
    campground.averageRating = sum / campground.reviews.length
    // save campground
    await campground.save()
    // flash message
    req.flash('success', "Congradulation, you successfully upload a review")
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteReview = wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', "You have successfully deleted your review")
    res.redirect(`/campgrounds/${id}`)
})