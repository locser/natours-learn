const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handleFacotry');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword .',
        400
      )
    );
  }

  // 2 filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;
  console.log('212312312');

  // 3 update user document
  const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  console.log(updateUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: 'null',
  });
});

// WARNING: don't update passwords with this method
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOneById(User);
exports.getUser = factory.getOne(User);

// exports.createUser = factory.createOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead.',
  });
};

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();

//   res.status(500).json({
//     status: 'success',
//     results: users.length,
//     data: { users },
//   });
// });

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// };
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// };

// exports.getUser = catchAsync((req, res, next) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// });
