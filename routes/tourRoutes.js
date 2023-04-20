const express = require('express');
const reviewRouter = require('./reviewRoutes');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
// const Review = require('../models/reviewsModel');
// const reviewController = require('../controller/reviewController');

const router = express.Router();

// router.param('id', tourController.checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

router.use('/:tourId/reviews', reviewRouter);

//alias
router
  .route('/top-5-popular')
  .get(tourController.aliasTopPopularTours, tourController.getAllTours);

router
  .route('/Tour-Stats')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getTourStats
  );
router.route('/Monthly-Plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTourById
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
