const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("CONNECTED TO DB".blue.inverse))
  .catch(err => console.error(err))

// Get data from JSON files
const bootcampsData = JSON.parse(fs.readFileSync(__dirname + "/_data/bootcamps.json"));
const coursesData = JSON.parse(fs.readFileSync(__dirname + "/_data/courses.json"));
const usersData = JSON.parse(fs.readFileSync(__dirname + "/_data/users.json"));

// Get data to the DB
const importData = async () => {
  try {
    // await Bootcamp.create(bootcampsData);
    // await Course.create(coursesData);
    await User.create(usersData);
    console.log("Bootcamp, Courses, Users data imported!!!".green.inverse);
    process.exit(0);
  } catch (err) {
    console.error(err);
  }
};

const deleteData = async () => {
  try {
    // await Bootcamp.deleteMany();
    // await Course.deleteMany();
    await User.deleteMany();
    console.log("All bootcamps, courses, users data deleted!!!".red.inverse);
    process.exit(0);
  } catch (err) {
    console.error(err);
  }
};

const flag = process.argv[2];
console.log("flag", flag, flag == "-d", process.env.MONGO_URI);
if (flag == "-i") {
  importData();
} else if (flag == "-d") {
  deleteData();
}
