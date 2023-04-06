const mongoose = require('mongoose');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [10, 'Price must be above 100'],
      // max: [500000, 'Price must be below 500000'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      // required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      select: false,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createBy: {
      type: String,
      defaultValue: 'Admin',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    updatedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  { timestamp: true }
);

tourSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
