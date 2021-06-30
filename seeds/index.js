// basic setup
const mongoose = require('mongoose')
const cities = require('./cities')
const Campground = require('../models/campground')
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// event will be called only once
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {

    //  in this case all cities got deleted next time we run the code
    await Campground.deleteMany({});

    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // author is default to vilavivida
            author: "60c8f5fb068678b234aa7fc6",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            // image: "https://source.unsplash.com/collection/483251",
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dly1h7mfd/image/upload/v1624331448/YelpCamp/iqex7dvcippqg0jbps7f.jpg',
                    filename: 'YelpCamp/iqex7dvcippqg0jbps7f'
                },
                {
                    url: 'https://res.cloudinary.com/dly1h7mfd/image/upload/v1624315543/YelpCamp/s4oa1qiqpwvoo15tvmvf.jpg',
                    filename: 'YelpCamp/s4oa1qiqpwvoo15tvmvf'
                }
            ]
        })
        // console.log(camp)

        await camp.save()
    }

}

// const seedDB = async () => {

//     //  in this case all cities got deleted next time we run the code
//     await Campground.deleteMany({});

//     for(let i = 0; i < 50; i++){
//         const random1000 = Math.floor(Math.random() * 1000)
//         const camp = new Campground({
//             location: `${cities[random1000].city}, ${cities[random1000].state}`,
//             title: `${sample(descriptors)}, ${sample(places)}`
//         })
//     await camp.save()
//     }

// }

// close the database (IMPORTANT!)
seedDB().then(() => {
    mongoose.connection.close();
})
