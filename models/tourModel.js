const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [50, 'A tour name must have  less or equal than 50 character'],
      // validator: [
      //   validator.isAlphanumeric,
      //   'Tour name must only contain [A_Za-z0-9]',
      // ],
      // github validator https://github.com/validatorjs/validator.js/
    },
    slug: String,
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
      enum: ['easy', 'medium', 'difficult'],
      required: {
        values: [true, 'A tour must have a difficulty'],
        message: 'Difficulty is either: easy - medium - difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0.0, 'Rating must be above 1.0'],
      max: [5.0, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.7777777 => 4.8
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [0, 'Price must be above 0'],
      // max: [500000, 'Price must be below 500000'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          if (val <= 0) val = 0;
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      // required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      select: true,
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
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],

    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    timestamp: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// document middle run before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  this.updatedAt = Date.now();
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: { $ne: true },
  });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -id',
    // TODO: remove user's role
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  this.find({
    secretTour: { $ne: true },
  });
  next();
});

//aggregation middleware
// tourSchema.pre('aggregation', function (next) {
//   /**Giải thích từng phần trong lệnh:

//     this.pipeline(): trả về pipeline hiện tại của truy vấn aggregation.
//     unshift(): phương thức thêm một phần tử vào đầu của mảng.
//     {$match: { secretTour: { $ne: true } } }: giai đoạn mới được thêm vào pipeline là một $match stage, nó sẽ loại bỏ tất cả các documents có trường secretTour bằng true.
//     Vì vậy, câu lệnh này sẽ thêm một giai đoạn mới vào đầu của pipeline aggregation để loại bỏ tất cả các tour có thuộc tính secretTour bằng true trước khi thực hiện các giai đoạn tiếp theo của truy vấn.
// */
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
