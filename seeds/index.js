const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const cities = require('./cities'); 
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});




const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 75) + 10;
        const camp = new Campground({
          //YOUR USER ID / reseed => node seeds/index
            author: '6451dac3f625097f32054c42',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'A great campground for exploring with the family!',
            price,
            geometry: { 
              type: 'Point',
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude 
              ]
            },
              
            images: [
                {
                  url: 'https://res.cloudinary.com/dbgjcmynd/image/upload/v1683097284/YelpCamp/pp0eqj8hkszrph5egdm5.jpg',
                  filename: 'YelpCamp/pp0eqj8hkszrph5egdm5',
                },
                {
                  url: 'https://res.cloudinary.com/dbgjcmynd/image/upload/v1683097284/YelpCamp/io5tgsvpbxk9xuznyotd.jpg',
                  filename: 'YelpCamp/io5tgsvpbxk9xuznyotd',
                },
                {
                  url: 'https://res.cloudinary.com/dbgjcmynd/image/upload/v1683097285/YelpCamp/klrqrkcku5grgogdbtw0.jpg',
                  filename: 'YelpCamp/klrqrkcku5grgogdbtw0',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
} );