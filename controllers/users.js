const User = require('../models/user')

// Error-Handling function
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

// render register
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

// register
module.exports.register = wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)

        // automatically log in after registration
        req.login(registeredUser, err => {
            if (err) return next(err)
        })

        console.log(registeredUser)
        req.flash('success', 'Welcome to Yelp Camp')
        res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', 'A user with the given username is already registered')
        res.redirect('/register')
    }
})

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.loginNew = (req, res) => {
    res.render('campgrounds/new')
}


module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!')
    // console.log(req.session.returnTo)
    const redirectURL = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectURL)
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('success', "GoodBye!")
    res.redirect('/campgrounds')
}