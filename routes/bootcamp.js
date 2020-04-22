/* Bootcamps route methods */
const express = require("express");
const {
  getBootcamps,
  getSingleBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require("../controllers/bootcamps");
const router = express.Router();

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

module.exports = router;
