const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Set security HTTP Headers
app.use(helmet());

//MIDDLEWARE STACK
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//LIMIT requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour! ',
});

app.use('/api', limiter);

//Required to get body from request
app.use(express.json({ limit: '10kb' }));

//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());
//Data Sanitization against CROSS SITE SCRIPTING
app.use(xss());
//Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
//ROUTE HANDLERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
