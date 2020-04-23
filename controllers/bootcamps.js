const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/ErrorResponse");

/* Bootcamps Route Controllers */
// Base bootcamps route, get all
// @route GET /api/v1/bootcamps
// @access public
exports.getBootcamps = async (req, res, next) => {
  try {
    const allBootcamps = await Bootcamp.find();
    res.status(200).send({
      success: true,
      data: allBootcamps,
      count: allBootcamps.length
    });
  } catch (err) {
    next(err);
  }
};
// Base bootcamps route, get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access public
exports.getSingleBootcamp = async (req, res, next) => {
  try {
    const singleBootcamp = await Bootcamp.findById(req.params.id);
    if (!singleBootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).send({
      success: true,
      data: singleBootcamp,
    });
  } catch (err) {
    next(err);
  }
};

// Add new bootcamp
// @route POST /api/v1/bootcamps
// @access private
exports.createBootcamp = async (req, res, next) => {
  try {
    const newBootcamp = await Bootcamp.create(req.body)
    res.status(201).send({
      success: true,
      data: newBootcamp,
    });
  } catch (err) {
    next(err);
  }
};

// Update a single bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access private
exports.updateBootcamp = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

// Delete a single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const deletedBootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!deletedBootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      data: "Bootcamp was deleted."
    });
  } catch (err) {
    next(err);
  }
};
