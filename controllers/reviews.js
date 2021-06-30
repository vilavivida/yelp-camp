const Campground = require('../models/campground')
const Review = require('../models/review')

// Error-Handling function
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}


module.exports.createReview = wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
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