const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const sendEmail = require('../utils/email');
const Email = require('../utils/email');

// const util = require('util');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  //remove password from
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;
  // if variable name and property name are same we can use

  const { email, password } = req.body;

  // 1 - check if  user email and password exist
  if (!email || !password) {
    next(new AppError('Please provide email and password!', 404));
  }

  // 2- checkk if correct
  const user = await User.findOne({ email }).select('+password');
  // FIX: when i have a email, and User.findOne return user null,
  //        i can get user.password to call user.correctPassword().
  // const correct = await user.correctPassword(password, user.password);

  // if (!user || !correct) {
  // first, it will check user null, check user password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3 - if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expiress: new Date(Date.now() + 3 * 1000),
    httpOnly: true,
  });
  //avoid jwt malformed
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1 getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.redirect('/');
    //ADD RETURN fix the issue of logging out when the user is on the /me account settings page and when logged out TAKES TO TO / ROUTE AND GETS RID OF ERR__HTTP_HEADERS_SENT ERROR....ERROR CHECK BELOW IS TOTALLY POINTLESS.

    // return next(
    //   new AppError('You are not logged in! Please log in to get access', 401)
    // );
  }
  // 2 verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 check if user still exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The token belonging to this user does no longer exist.',
        401
      )
    );
  }
  // 4 check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again!')
    );
  }

  // grant access to protected route
  req.user = currentUser;
  next();
});

//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt === null) {
    return next();
  }

  if (req.cookies.jwt) {
    try {
      //1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2 check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
        //IF TRUE (NO USER EXISTS) GET OUT OF THIS MIDDLEWARE AND MOVEON WITH THE NEXT()
      }

      // 3 check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
        //IF TRUE (PASSWORD CHANGED) GET OUT OF THIS MIDDLEWARE AND MOVEON WITH THE NEXT()
      }

      // there is a logged in user
      //->GRANT ACCESS TO THE PROTECTED VIEW
      res.locals.user = currentUser;
      //VERY IMPORTANT! Each and every pug template will have access to res.locals. So whatever variable defiend thru locals is accessible by PUG files.
      return next();
    } catch (e) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to acces this action!', 403)
      );
    }
    next();
    // return (req, res, next) => {
    //   // roles ['admin', 'lead-guide']
    //   if (!roles.includes(req.user.role)) {
    //     return next(
    //       new AppError('You do not have permission to acces this action!', 403)
    //     );
    //   }
    //   next();
    // };
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1 get user based on posted mail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2 generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // hủy các validatorBeforeSave
  await user.save({ validatorBeforeSave: false });

  //3 send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validatorBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get user  based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 if token has not expired, and there is  user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 404));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3 udpate changedPAsswordAt prop for user
  // 4 Log the user in,  send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 get user from colllections
  const user = await User.findById(req.user.id).select('+password');

  // 2 check if posted current password true
  const correct = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!correct) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3 if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // User.findByIdAndUpdate
  //4 Log the user in, send JWT token
  createSendToken(user, 200, res);
});
