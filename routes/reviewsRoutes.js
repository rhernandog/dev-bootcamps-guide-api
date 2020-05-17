const express = require("express");
const router = express.Router({ mergeParams: true });
const advancedResults = require("../middleware/advancedResults");
const { protectRoute, authorize } = require("../middleware/auth");
const Review = require("../models/Review");
const {
  getAllReviews,
  getSingleReview,
  addReview,
  updatedReview,
  deleteReview
} = require("../controllers/reviewsControllers");

router
  .route("/")
  .get(advancedResults(Review, {
    path: "bootcamp",
    select: "name description"
  }), getAllReviews)
  .post(protectRoute, authorize("user", "admin"), addReview);

router
  .route("/:reviewId")
  .get(getSingleReview)
  .put(protectRoute, authorize("user", "admin"), updatedReview)
  .delete(protectRoute, authorize("user", "admin"), deleteReview);

module.exports = router;
