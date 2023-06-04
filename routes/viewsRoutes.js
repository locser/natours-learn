const express = require('express');
const viewsController = require('../controller/viewsController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);

router.get('/tours/:slug', authController.protect, viewsController.getTour);
router.get('/login', viewsController.getLogin);

module.exports = router;
