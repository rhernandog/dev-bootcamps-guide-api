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
const { protectRoute, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedResults(Course, {
    path: "bootcamp",
    select: "name description"
  }), getCourses)
  .post(protectRoute, authorize("publisher", "admin"), addCourse);

// Single course routes
router
  .route("/:id")
  .get(advancedResults({
    path: "bootcamp",
    select: "name description"
  }), getCourse)
  .put(protectRoute, authorize("publisher", "admin"), updateCourse)
  .delete(protectRoute, authorize("publisher", "admin"), deleteCourse);

module.exports = router;
