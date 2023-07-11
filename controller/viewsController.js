const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getOverview = catchAsync(async (req, res) => {
  // 1 get tour data from collection
  const tours = await Tour.find();

  // 2 build template

  // 3 Render that template using data from collection

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1 get the data for requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with the name!', 404));
  }

  // 2 Build template

  // 3 Render that template using data from collection
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});

exports.getLogin = (req, res) => {
  // FIXME: fix on browser s://cdn.jsdelivr.net/npm/axios/dist/axios.min.js' because it violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
      // 7.0.0.1:3000/api/v1/users/login' because it violates the following Content Security Policy directive:
      // "connect-src 'self' https://cdnjs.cloudflare.com".
      // ->  views/base/pug
    )
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getAccout = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updateUser,
  });
});
