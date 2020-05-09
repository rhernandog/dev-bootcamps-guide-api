/* Bootcamps route methods */
const express = require("express");
const Bootcamp = require("../models/Bootcamp");
const {
  getBootcamps,
  getSingleBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcambUploadPhoto,
} = require("../controllers/bootcamps");
const coursesRouter = require("./course");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

// Pass all requests to the courses for a bootcamp id
// to the courses router
router.use("/:bootcampId/courses", coursesRouter);

// Get all bootcamps
router
  .route("/")
  .get(advancedResults(Bootcamp, {
    path: "courses",
    select: "title"
  }), getBootcamps)
  .post(createBootcamp);
// Get a single bootcamp
router
  .route("/:id")
  .get(getSingleBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
// Photo route
router
  .route("/:id/photo")
  .put(bootcambUploadPhoto);

// Get bootcamps within a radius
router
  .route("/radius/:zipcode/:distance")
  .get(getBootcampsInRadius);

module.exports = router;
