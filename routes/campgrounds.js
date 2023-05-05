const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')

const AppError = require('../utils/AppError')
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
// const Review = require('../models/review');
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createNewCampground));
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send('IT WORKED!');
    // })
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn, isAuthor, upload.array('image'), validateCampground,  catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));




router.get('/:id/edit', isLoggedIn, isAuthor ,catchAsync(campgrounds.editCampground));






module.exports = router;