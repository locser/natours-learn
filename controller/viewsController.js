const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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

exports.getTour = catchAsync(async (req, res) => {
  // 1 get the data for requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // 2 Build template

  // 3 Render that template using data from collection
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});

exports.getLogin = (req, res) => {
  // res.status(200).render('login', {
  //   title: 'Login into your account',
  // });

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
