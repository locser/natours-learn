const express = require('express');
const tourController = require('../controller/tourController');

const router = express.Router();

// router.param('id', tourController.checkID);
//alias
router
  .route('/top-5-popular')
  .get(tourController.aliasTopPopularTours, tourController.getAllTours);

router.route('/Tour-Stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(tourController.deleteTour);

module.exports = router;
