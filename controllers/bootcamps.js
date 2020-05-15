const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const path = require("path");

/* Bootcamps Route Controllers */
/** Get All Bootcamps
 * @route /api/v1/bootcamps
 * @method GET
 * @public
*/
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/** Get Single Bootcamp
 * @route /api/v1/bootcamps/:id
 * @method GET
 * @public
*/
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
  const singleBootcamp = await Bootcamp.findById(req.params.id);
  if (!singleBootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).send({
    success: true,
    data: singleBootcamp,
  });
});

/** Create Single Bootcamp
 * @route /api/v1/bootcamps
 * @method POST
 * @private
*/
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add the logged in user id to the req body in order to add it to the
  // bootcamp document
  req.body.user = req.user.id;
  // Check that the user hasn`t published another bootcamp.
  // Users with the publisher role can publish only one bootcamp,
  // admin users can publish unlimited bootcamps
  const publsihedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  if (publsihedBootcamp && req.user.role !== "admin") {
    return next(new ErrorResponse("Publisher users can add only one bootcamp.", 403));
  }
  const newBootcamp = await Bootcamp.create(req.body);
  res.status(201).send({
    success: true,
    data: newBootcamp,
  });
});

/** Update Single Bootcamp
 * @route /api/v1/bootcamps/:id
 * @method PUT
 * @private
*/
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // Make sure the logged in user is the bootcamp owner
  let targetBootcamp = await Bootcamp.findById(req.params.id);
  if (!targetBootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  if (targetBootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`The user with id${req.user.id}, is not authorized to update the bootcamp`, 401));
  }
  // The bootcamp exists and the user can updated it
  targetBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: targetBootcamp
  });
});

/** Delete Single Bootcamp
 * @route /api/v1/bootcamps/:id
 * @method DELETE
 * @private
*/
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const targetBootcamp = await Bootcamp.findById(req.params.id);
  if (!targetBootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  // Check that the logged in user is the user associated with the
  // bootcamp
  if (targetBootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`The user with id: ${req.user.id} is not authorized to delete this bootcamp.`, 401));
  }
  targetBootcamp.remove();
  res.status(200).json({
    success: true,
    data: "Bootcamp was deleted."
  });
});

/** Find Bootcamps in Radius
 * @route /api/v1/bootcamps/radius/:zipcode/:distance
 * @method GET
 * @public
*/
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // get coordinates from geocoder
  const location = await geocoder.geocode(zipcode);
  const lat = location[0].latitude;
  const lng = location[0].longitude;
  // Estimate the radius
  // 3963.2 mi or 6378.1 km
  const radius = distance / 3963.2;
  const bootcampsInDistance = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat],
          radius
        ]
      }
    }
  });
  // Response
  res.status(200).json({
    success: true,
    count: bootcampsInDistance.length,
    data: bootcampsInDistance,
  });
});

/** Upload Bootcamp Photo
 * @route PUT /api/v1/bootcamps/:id/photo
 * @private
*/
exports.bootcambUploadPhoto = asyncHandler(async (req, res, next) => {
  const targetBootcamp = await Bootcamp.findById(req.params.id);
  if (!targetBootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  // Check that the logged in user is the bootcamp owner
  if (targetBootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`The user with id: ${req.user.id} is not authorized to upload a photo for ths bootcamp.`, 401));
  }
  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }
  const { file } = req.files;
  if (!file.mimetype.match(/(image)\b/g)) {
    return next(new ErrorResponse("Please upload an image file type.", 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    return next(new ErrorResponse("The max file size is 600kb", 400));
  }
  // Create a custom filename
  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;
  // Move the file to the target folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    console.log("moving file");
    if (err) {
      return next(new ErrorResponse("Couldn't move the file to the target folder", 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    console.log("updating bootcamp photo");
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: file.name
    });
  });
});
