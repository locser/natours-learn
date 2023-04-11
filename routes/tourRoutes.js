const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

const router = express.Router();

// router.param('id', tourController.checkID);
//alias
router
  .route('/top-5-popular')
  .get(tourController.aliasTopPopularTours, tourController.getAllTours);

router.route('/Tour-Stats').get(tourController.getTourStats);
router.route('/Monthly-Plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
