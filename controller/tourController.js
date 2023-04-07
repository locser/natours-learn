const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopPopularTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingsAverage, price, difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  //execute final query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const features = new APIFeatures(Tour.find(), req.query);
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    // requestedAt: req.requestTime,
    length: tours.length,
    data: tours,
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(Object(req.params.id));
  // Tour.findOne(Object(req.params.id)

  //if tour is null -> error
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.createTour2 = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newTour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newTour,
  });

  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({
  //     status: 'success',
  //     data: newTour,
  //   });
  // } catch (err) {
  //   res.status(500).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});

exports.updateTourById = async (req, res, next) => {
  await Tour.findByIdAndUpdate(
    Object(req.params.id),
    req.body,
    {
      new: true,
      runValidators: true,
    },
    (error, tour) => {
      if (error) {
        res.status(500).json({
          status: 'Failed to update',
          message: error.message,
        });
      } else {
        res.status(200).json({
          status: 'Updated successfully',
          data: tour,
        });
      }
    }
  );
};

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(Object(req.params.id));
  //if tour is null -> error
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        number: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        number: 1,
        tours: 1,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    length: plan.length,
    data: plan,
  });
});
