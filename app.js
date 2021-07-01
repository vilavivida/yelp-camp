if (process.env.NODE_ENV !== "production") {
	require('dotenv').config()
}

// basic setup
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const Review = require('./models/review')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews');
const { static } = require('express');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')


// const dbUrl = process.env.DB_URL
const secret = process.env.SECRET || 'thisshouldbeabetter'
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

// store session in MongoDB
const MongoDBStore = require('connect-mongo')

// 'mongodb://localhost:27017/yelp-camp'

// use dbUrl to connect to the cloud mongo
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// event will be called only once
db.once("open", () => {
	console.log("Database connected");
});

const app = express()

// set up path
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// parse format
app.use(express.urlencoded({ extended: true }));

// further express functions (such as app.put)
app.use(methodOverride('_method'));

// Express looks up the files in the order
// in which you set the static directories with the express.

app.use(express.static(path.join(__dirname, 'public')))

app.use(
	mongoSanitize({
		replaceWith: '_',
	}),
);

app.use(helmet())

// define urls that are allowed on the web
const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com",
	"https://api.tiles.mapbox.com",
	"https://api.mapbox.com",
	"https://kit.fontawesome.com",
	"https://cdnjs.cloudflare.com",
	"https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com",
	"https://stackpath.bootstrapcdn.com",
	"https://api.mapbox.com",
	"https://api.tiles.mapbox.com",
	"https://fonts.googleapis.com",
	"https://use.fontawesome.com",
];
const connectSrcUrls = [
	"https://api.mapbox.com",
	"https://*.tiles.mapbox.com",
	"https://events.mapbox.com",
];
const fontSrcUrls = [];

// specifying our own helmet
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			childSrc: ["blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dly1h7mfd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
				"https://images.unsplash.com",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

const sessionConfig = {
	// rename the session
	name: 'session',
	secret: secret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		// if the cookie expires in a week 
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	},
	store: MongoDBStore.create({
		mongoUrl: dbUrl,
		touchAfter: 24 * 60 * 60
	})
}

sessionConfig.store.on('error', function (e) {
	console.log('Session Store Error', e)
})

app.use(session(sessionConfig))
// set up key to the flash
app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())

// the authenticate function is plugged in by passportLocalMongoose
passport.use(new LocalStrategy(User.authenticate()))

// store users in the session
passport.serializeUser(User.serializeUser())
// get users out of the session
passport.deserializeUser(User.deserializeUser())

//  (IMPORTANT) setting locals variable 
//  should be done after initializing passport

app.use((req, res, next) => {
	// set currentUser
	res.locals.currentUser = req.user;
	// sucess key
	res.locals.success = req.flash('success');
	// error key
	res.locals.error = req.flash('error');
	next();
})

// introducing routers
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

// main route
app.get('/', (req, res) => {
	// no need to add 'views/'' here
	res.render('home')
})

// for every single request
app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found, 404'))
})

// handling error
app.use((err, req, res, next) => {
	// set up defaults
	const { statusCode = 500 } = err
	if (!err.message) err.message = "Something went wrong"
	res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000

app.listen(port, (req, res) => {
	console.log(`LISTENING FROM THE ${port}`)
})