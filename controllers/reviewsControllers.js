const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");

/** Get All Reviews
 * @method GET
 * @route /api/v1/reviews
 * @route /api/v1/bootcamps/:bootcampId/reviews
 * @public
*/
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  // Check if there is a bootcamp in the req params,
  // in that case get all the reviews for that particular bootcamp
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      data: reviews,
      count: reviews.lenght
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/** Get Single Review
 * @method GET
 * @route /api/v1/reviews/:reviewId
 * @public
*/
exports.getSingleReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId).populate({
    path: "bootcamp",
    select: "name description"
  });
  if (!review) {
    return next(new ErrorResponse("Cannot find a review with the provided id.", 404));
  }
  res.status(200).json({
    success: true,
    data: review
  });
});

/** Create a Review
 * Adds a review to a specific bootcamp
 * @method POST
 * @route /api/v1/bootcamps/:bootcampId/reviews
 * @pirvate
*/
exports.addReview = asyncHandler(async (req, res, next) => {
  const { bootcampId } = req.params;
  // Add the bootcamp id to the data send to the DB
  req.body.bootcamp = bootcampId;
  // Add the logged in user as well
  req.body.user = req.user.id;

  const targetBootcamp = await Bootcamp.findById(bootcampId);
  if (!targetBootcamp) {
    return next(new ErrorResponse(`Cannot find a bootcamp with the ID ${bootcampId}`, 404));
  }
  const newReview = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: newReview
  });
});

/** Update a Review
 * Only the review owner or the admin can update a review.
 * @method PUT
 * @route /api/v1/reviews/:reviewId
 * @private
*/
exports.updatedReview = asyncHandler(async (req, res, next) => {
  // Check that the review exists
  let targetReview = await Review.findById(req.params.reviewId);
  if (!targetReview) {
    return next(new ErrorResponse(`Cannot find a review with the ID ${req.params.reviewId}`, 404));
  }
  // Check that the logged in user is the owner of the review or has the role
  if (targetReview.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("You don't have access to this particular route", 401));
  }
  targetReview = await Review.findByIdAndUpdate(req.params.reviewId, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: targetReview
  });
});

/** Delete a Review
 * Only the owner or the admin can delete a review
 * @method DELETE
 * @route /api/v1/reviews/:reviewId
 * @private
*/
exports.deleteReview = asyncHandler(async (req, res, next) => {
  // Check that the review exists
  const targetReview = await Review.findById(req.params.reviewId);
  if (!targetReview) {
    return next(new ErrorResponse(`Cannot find a review with the ID ${req.params.reviewId}`, 404));
  }
  // Check that the user is the owner or has the role to delete the review
  if (targetReview.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("You don't have access to this route.", 401));
  }
  await targetReview.remove();
  res.status(200).json({
    success: true,
    message: "Review removed"
  });
});
