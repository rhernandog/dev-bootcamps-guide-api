const express = require("express");
const Course = require("../models/Course");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require("../controllers/courses");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedResults(Course, {
    path: "bootcamp",
    select: "name description"
  }), getCourses)
  .post(addCourse);

// Single course routes
router
  .route("/:id")
  .get(advancedResults({
    path: "bootcamp",
    select: "name description"
  }), getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;
