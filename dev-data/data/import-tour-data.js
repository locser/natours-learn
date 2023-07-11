const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connect to database successfully');
  });

//READ Json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Promise.all([
      Tour.create(tours),
      User.create(users, { validateBeforeSave: false }),
      Review.create(reviews),
    ]);
    console.log('Data imported successfully');
  } catch (err) {
    console.log(err);
  }
};

const deleteAll = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err);
  }
};

// --import là truyền vào đối số
// kiểm tra đối số

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAll();
}

// console.log(process.argv);

// ERROR: import data
/**
 * Error: User validation failed: passwordConfirm: Please confirm a password
 * turn off validation when importing data
 */

// // import data into database
// const importData = async () => {
//   await Tour.create(tours, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(' Tour Data imported successfully');
//     }
//   });
//   await User.create(users, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('Users Data imported successfully');
//     }
//   });
//   await Review.create(reviews, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('Reviews Data imported successfully');
//     }
//   });
// };

// //delete all data from collection
// const deleteAll = async () => {
//   await Tour.deleteMany((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('Data deleted successfully');
//     }
//   });
//   await User.deleteMany((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('Data deleted successfully');
//     }
//   });
//   await Review.deleteMany((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('Data deleted successfully');
//     }
//   });
// };
