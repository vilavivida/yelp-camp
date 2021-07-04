const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

const { cloudinary } = require('../cloudinary')


// Error-Handling function
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

module.exports.index = async (req, res) => {
    // campgrounds contains all the campgrounds in the database
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = wrapAsync(async (req, res, next) => {
    // geocoder
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground)

    // save geoJSON to the geometry property
    campground.geometry = geoData.body.features[0].geometry
    console.log('[longitude, latitude]: ', campground.geometry)

    // save image path and filename to campground object
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))

    // record the user who created the campground
    campground.author = req.user._id

    await campground.save()
    req.flash('success', "Congradulation, you successfully made a new campground")
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.showCampground = wrapAsync(async (req, res) => {
    // get author of reviews
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author')

    if (!campground) {
        req.flash('error', "Cannot find the campground you searched")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
})

module.exports.renderEditForm = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', "Cannot find the campground you searched")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
})

module.exports.updateCampground = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteCampground = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})