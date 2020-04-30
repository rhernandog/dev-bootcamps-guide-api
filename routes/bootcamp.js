/* Bootcamps route methods */
const express = require("express");
const {
  getBootcamps,
  getSingleBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");
const coursesRouter = require("./course");

const router = express.Router();

// Pass all requests to the courses for a bootcamp id
// to the courses router
router.use("/:bootcampId/courses", coursesRouter);

// Get all bootcamps
router
  .route("/")
  .get(getBootcamps)
  .post(createBootcamp);
// Get a single bootcamp
router
  .route("/:id")
  .get(getSingleBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

// Get bootcamps within a radius
router
  .route("/radius/:zipcode/:distance")
  .get(getBootcampsInRadius);

module.exports = router;
