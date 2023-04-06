const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' });

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
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data into database
const importData = async () => {
  await Tour.create(tours, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Data imported successfully');
    }
  });
};

//delete all data from collection
const deleteAll = async () => {
  await Tour.deleteMany((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Data deleted successfully');
    }
  });
};

// --import là truyền vào đối số
// kiểm tra đối số

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAll();
}

console.log(process.argv);
