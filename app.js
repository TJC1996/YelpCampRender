if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

    // require('dotenv').config();



console.log(process.env.SECRET)
console.log(process.env.API_KEY)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
// const Campground = require('./models/campground');
// const req = require('express/lib/request');
// const res = require('express/lib/response');
const AppError = require('./utils/AppError')
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const { campgroundSchema, reviewSchema } = require('./schemas.js')
// const { wrap } = require('module');
const MongoStore = require('connect-mongo');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const req = require('express/lib/request');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'
const dbUrl = process.env.DB_URL ||  'mongodb://localhost:27017/yelp-camp';

const secret =  process.env.SECRET || 'secretkeyexample';

// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// //////////////////////
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret 
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

mongoose.set('strictQuery', false);

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// try {
//     mongoose.connect('mongodb://localhost:27017/yelp-camp');
//     console.log("Mongo Connection Open!")
// }
// catch (err) {
//     console.log("OH NO Mongo ERROR!")
//     console.log(err)
// }
// // mongoose.set('strictQuery', true);




const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_',
}),
);
app.use(helmet());
const sessionConfig = {
    store,
    name: 'campground',
    secret,
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbgjcmynd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();

})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'tonyclark1996@gmail.com', username: 'Tplark' });
    const newUser = await User.register(user, 'monkey'); //monkey is password
    res.send(newUser);
})



app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req,res) => {
    res.render('home')
});

// app.get('/makecampground', async (req, res) => {
//     const { id } = req.params;
//     const camp = new Campground({title: 'Big Sur', price: 75, description: 'A quaint camprground on the ocean cliff, perfect for a weekend getaway!', location: 'Big Sur California'})
//     await camp.save();
//     res.send(camp)
//     console.log(`${camp.title} added!`)
// })



app.all('*', (req, res, next) => {
   next(new AppError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong!'
    res.status(status).render('error', {err});
    // res.send("OH Boy something went wrong")
})


app.listen(3000, () => {
    console.log('Serving on port 8080')
})


// app.post('/campgrounds', async (req, res, next) => {
//     try {
//         const campground = new Campground(req.body.campground);
//         await campground.save();
//         res.redirect(`/campgrounds/${campground._id}`)
//     } catch(err) {
//         next(err);
//     }
// });


// console.log(err.name);
//     res.send('Oh NO something went wrong!')
//     next(err);

