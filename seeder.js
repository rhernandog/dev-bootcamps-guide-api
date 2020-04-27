const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const Bootcamp = require("./models/Bootcamp");

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

// Get data to the DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcampsData);
    console.log("Bootcamp data imported!!!".green.inverse);
    process.exit(0);
  } catch (err) {
    console.error(err);
  }
};

const deleteData = async () => {

  try {
    await Bootcamp.deleteMany();
    console.log("All bootcamps data deleted!!!".red.inverse);
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
