const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    body: String,
    rating: {
        type: Number,
        required: "Please leave your rating between 1 - 5 stars.",
        min: 1,
        max: 5,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // associate review with the campground
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    }
})

module.exports = mongoose.model('Review', reviewSchema)