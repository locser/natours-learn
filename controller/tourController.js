const Tour = require('../models/tourModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.aliasTopPopularTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingsAverage, price';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Tạo một object để lưu trữ các thuộc tính được chọn
    let queryObj = { ...req.query };
    console.log(queryObj);

    // Các thuộc tính cần lọc bỏ, do không phải là các thuộc tính của model
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // Loại bỏ các thuộc tính không phải là các thuộc tính của model khỏi object queryObj
    excludedFields.forEach((field) => delete queryObj[field]);

    // Duyệt qua các thuộc tính còn lại trong queryObj và thêm vào object projection
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    queryObj = JSON.parse(queryString);
    // console.log(queryObj);

    //get Tour
    let query = Tour.find(queryObj);

    //2 sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      queryObj.sort = sortBy;
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    //3 fields limit
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //4 paginations per
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 8;
    const skip = (page - 1) * limit;
    //if limit = 10 - page 1 : 0-9, page 2 =  10 -19
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip > numTours) {
        throw new Error('This page is not available');
      }

      // const pages = Math.ceil(query.count() / limit);
      // res.status(200).json({
      //   status:'success',
      //   requestedAt: req.requestTime,
      //   data: query,
      //   pages: pages,
      // });
    }

    //execute final query
    const tours = await query;

    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
    // const tours = await Tour.find(queryObj);

    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime,
      length: tours.length,
      data: tours,
    });

    // const tour = await Tour.find();
    // res.status(200).json({
    //   status: 'success',
    //   requestedAt: req.requestTime,
    //   data: tour,
    // });
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
  /*
  try {
    const tour = await Tour.findByIdAndUpdate(Object(req.params.id), req.body, {
      new: true,
    });
    // Tour.findOne(Object(req.params.id)

    res.status(200).json({
      status: 'Updated successfully',
      data: tour,
    });
  } catch (error) {
    res.status(error.status).json({
      status: 'Failed to update',
      message: error.message,
    });
  }
*/
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
