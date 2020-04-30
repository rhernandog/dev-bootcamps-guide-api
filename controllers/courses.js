const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

/** Get All Courses
 * @route GET /api/v1/courses
 * @route GET /api/v1/bootcamps/:bootcampId/courses
 * @public
 * @returns {Array} Array with all the courses
*/
exports.getCourses = asyncHandler(async (req, res, next) => {
  let coursesQuery;

  if (req.params.bootcampId) {
    coursesQuery = Course.find({
      bootcamp: req.params.bootcampId
    }).populate({
      path: "bootcamp",
      select: "name description"
    });
  } else {
    coursesQuery = Course.find().populate({
      path: "bootcamp",
      select: "name description"
    });
  }

  const courses = await coursesQuery;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

/** Get Single Course
 * @route GET /api/v1/courses/:id
 * @returns {Object} An object with the course data
*/
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course
    .findById(req.params.id)
    .populate({
      path: "bootcamp",
      select: "name description"
    });
  if (!course) {
    console.log(course);
    return next(new ErrorResponse(`No course found with the ID: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

/** Add Single Course
 * @route POST /api/v1/bootcamps/:bootcampId/courses
 * @private
 * @returns {Object} The created course
*/
exports.addCourse = asyncHandler(async (req, res, next) => {
  // Get the bootcamp id in order to check the bootcamp exists
  const targetBootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!targetBootcamp) {
    return next(new ErrorResponse(`Cannot find a bootcamp with the ID: ${req.params.bootcampId}`, 404));
  }
  req.body.bootcamp = req.params.bootcampId;
  const newCourse = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: newCourse
  });
});

/** Update Single Course
 * @route PUT /api/v1/courses/:id
 * @private
*/
exports.updateCourse = asyncHandler(async (req, res, next) => {
  // Get the course with the passed ID
  const targetCourse = await Course.findById(req.params.id);

  if (!targetCourse) {
    return next(new ErrorResponse(`Cannot find a course with the ID: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: targetCourse
  })
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const targetCourse = await Course.findById(req.params.id);

  if (!targetCourse) {
    return next(new ErrorResponse(`Cannot find a course with the ID: ${req.params.id}`, 404));
  }

  await targetCourse.remove();

  res.status(200).json({
    success: true,
    data: "Course was deleted"
  });
});
