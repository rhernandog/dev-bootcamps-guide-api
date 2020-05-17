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
const reviewsRouter = require("./reviewsRoutes");
const advancedResults = require("../middleware/advancedResults");
const { protectRoute, authorize } = require("../middleware/auth");

const router = express.Router();

// Pass all requests to the courses for a bootcamp id
// to the courses router
router.use("/:bootcampId/courses", coursesRouter);
router.use("/:bootcampId/reviews", reviewsRouter);

// Get all bootcamps
router
  .route("/")
  .get(advancedResults(Bootcamp, {
    path: "courses",
    select: "title"
  }), getBootcamps)
  .post(protectRoute, authorize("publisher", "admin"), createBootcamp);
// Get a single bootcamp
router
  .route("/:id")
  .get(getSingleBootcamp)
  .put(protectRoute, authorize("publisher", "admin"), updateBootcamp)
  .delete(protectRoute, authorize("publisher", "admin"), deleteBootcamp);
// Photo route
router
  .route("/:id/photo")
  .put(protectRoute, authorize("publisher", "admin"), bootcambUploadPhoto);

// Get bootcamps within a radius
router
  .route("/radius/:zipcode/:distance")
  .get(getBootcampsInRadius);

module.exports = router;
