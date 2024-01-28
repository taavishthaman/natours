const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection Successful!'));

//READ Json File
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

//Import Data into the Database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully Uploaded...');
    process.exit();
  } catch (err) {
    console.log('Error', err);
  }
};

//Delete all Data from a collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Successfully Deleted...');
    process.exit();
  } catch (err) {
    console.log('Error', err);
  }
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);

//Use this Command: node dev-data/data/import-dev-data.js --import
