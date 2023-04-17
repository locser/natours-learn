const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// security HTTP header
app.use(helmet());

//development logging
//add middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// serving static files
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// limit request form same API
const limiter = rateLimit({
  max: 100, //max requests per hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '100kb',
  })
);

// data sanitization against NOSQL query injection
app.use(mongoSanitize());
//data sanitization against XSS
app.use(xss());

// prevent param  pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage'],
  })
);

app.use((req, res, next) => {
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

// /Implementing a Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
