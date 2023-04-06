const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopPopularTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingsAverage, price, difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(Object(req.params.id));
    // Tour.findOne(Object(req.params.id)

    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (error) {
    res.status(error.status).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTourById = async (req, res) => {
  await Tour.findByIdAndUpdate(
    Object(req.params.id),
    req.body,
    { new: true, runValidators: true },
    (error, tour) => {
      if (error) {
        res.status(error.status).json({
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

exports.deleteTour = async (req, res) => {
  await Tour.findByIdAndDelete(Object(req.params.id), (err) => {
    if (err) {
      res.status(err.status).json({
        status: 'Failed to delete',
        message: err.message,
      });
    } else {
      res.status(204).json({
        status: 'success',
        message: 'Tour deleted successfully',
      });
    }
  });
};
