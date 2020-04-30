const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please provide a course title"]
  },
  description: {
    type: String,
    required: [true, "Please provide a description"]
  },
  weeks: {
    type: String,
    required: [true, "Please provide a description"]
  },
  tuition: {
    type: Number,
    required: [true, "Please provide a tuition amount"]
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill for the course"],
    enum: ["beginner", "intermediate", "advanced"]
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true
  }
});

// Define the static average cost method
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const resultArray = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: {
          $avg: "$tuition"
        }
      }
    }
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(resultArray[0].averageCost / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
};

// After adding and removing a course, calculate the average cost
// for that particular bootcamp
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre("remove", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model("Course", CourseSchema);
