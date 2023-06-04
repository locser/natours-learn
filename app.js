const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// security HTTP header
// app.use(helmet());

// FIXME: You can edit your app.js helmet line like this. I used unpkg cdn domain for axios, you can just put cloudflare or whatever you're using. For css, like font awesome, I guess you use styleSrc, and for fonts you use fontSrc.
// before
// app.use(helmet());

//after
// time: before 01-06
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'unpkg.com'],
//       styleSrc: ["'self'", 'cdnjs.cloudflare.com'],
//       // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
//     },
//   })
// );
// TODO: 01/06/2023 config helmet.contentSecurityPolicy()
// time - 03/06

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'unpkg.com'],
      styleSrc: ["'self'", 'cdnjs.cloudflare.com'],
      // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
    },
  })
);

//development logging
//add middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit request form same API
const limiter = rateLimit({
  max: 100, //max requests per hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser()); // npm i cookie-parser

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

// middleware for testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  // console.log(req.headers);

  //test cookie logging
  console.log(`- cookie: ${req.cookies.jwt}`);
  next();
});

// Routes
app.use('/', viewsRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

// /Implementing a Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
