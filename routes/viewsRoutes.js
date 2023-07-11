const express = require('express');
const viewsController = require('../controller/viewsController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

// router.use(authController.isLoggedIn);
/*
    if  u set isLoggedIn for all routes, '/me' is duplicated check
*/

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/me', authController.protect, viewsController.getAccout);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);

module.exports = router;
