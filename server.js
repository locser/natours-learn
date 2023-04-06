const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

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

// console.log(process.env);
const port = process.env.PORT || 3000;

//start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/**
 * 


//Testing the tour model
const testTour = new Tour({
  name: 'Phim siêu cấp bruh',
  rating: 5.0,
  price: 1000,
  country: 'Vietnam',
  city: 'Ho Chi Minh City',
  image:
    'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
});
testTour
  .save()
  .then((tour) => {
    console.log(tour);
  })
  .catch((err) => {
    console.log(`SAVE: Error: ${err}`);
  });
 */
