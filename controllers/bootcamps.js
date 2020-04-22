const Bootcamp = require("../models/Bootcamp");

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
    res.status(400).json({
      success: false,
      error: err
    });
  }
};
// Base bootcamps route, get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access public
exports.getSingleBootcamp = async (req, res, next) => {
  try {
    const singleBootcamp = await Bootcamp.findById(req.params.id);
    if (!singleBootcamp) {
      return res.status(400).json({
        success: false,
        error: "Cannot find a bootcamp for the given ID."
      });
    }
    res.status(200).send({
      success: true,
      data: singleBootcamp,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err
    });
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
    res.status(400).json({
      success: false,
      error: err
    })
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
      return res.status(400).json({
        success: false,
        error: "Cannot find a bootcamp for the given ID."
      });
    }
    res.status(200).json({
      success: true,
      data: updatedBootcamp
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err
    });
  }
};

// Delete a single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const deletedBootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!deletedBootcamp) {
      return res.status(400).json({
        success: false,
        error: "Cannot find and delete a bootcamp for the given ID."
      });
    }
    res.status(200).json({
      success: true,
      data: "Bootcamp was deleted."
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err
    });
  }
};
