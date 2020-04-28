const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");

/* Bootcamps Route Controllers */
// Base bootcamps route, get all
// @route GET /api/v1/bootcamps
// @access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const queryCopy = { ...req.query };
  // Specific filter, sort, limit query strings
  const queryRemoveFields = ["select", "sort", "limit", "page"];
  queryRemoveFields.forEach(field => delete queryCopy[field]);

  // Create a string of the query to add the $ sign for query operators
  let parsedQuery = JSON.stringify(queryCopy);
  // Query operators
  parsedQuery = parsedQuery.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  parsedQuery = JSON.parse(parsedQuery);

  // Create a Mongo query object
  let bootcampsQuery = Bootcamp.find(parsedQuery);

  // Select query
  // Create a string with the select projection in order
  // to return only those values on each document
  if (req.query.select) {
    // Change commas for spaces to comply the mongoose projection form
    const selectFields = req.query.select.replace(/,/g, " ");
    bootcampsQuery = bootcampsQuery.select(selectFields);
  }

  // Sort query
  if (req.query.sort) {
    const sortField = req.query.sort.split(",")[0];
    console.log(req.query.sort, sortField);
    bootcampsQuery.sort(sortField);
  } else {
    bootcampsQuery.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  // Limit
  const limit = parseInt(req.query.limit, 10) || 20;
  // Skip, if the page number is more than one skip the first set of
  // results, that are equal to the previous page times the limit
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalDocuments = await Bootcamp.countDocuments();
  bootcampsQuery.skip(startIndex).limit(limit);

  const allBootcamps = await bootcampsQuery;

  const pagination = {
    prev: null,
    current: page,
    next: null,
  };

  if (endIndex < totalDocuments) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).send({
    count: allBootcamps.length,
    pagination,
    success: true,
    data: allBootcamps,
  });
});

// Base bootcamps route, get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access public
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

// Add new bootcamp
// @route POST /api/v1/bootcamps
// @access private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const newBootcamp = await Bootcamp.create(req.body);
  res.status(201).send({
    success: true,
    data: newBootcamp,
  });
});

// Update a single bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updatedBootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: updatedBootcamp
  });
});

// Delete a single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const deletedBootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!deletedBootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: "Bootcamp was deleted."
  });
});

// Find all bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access private
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
