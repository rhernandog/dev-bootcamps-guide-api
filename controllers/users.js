const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");

/** Get All Users
 * @route /api/v1/auth/users
 * @method GET
 * @private Only Admin
*/
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/** Get Single User
 * @route /api/v1/auth/users/:id
 * @method GET
 * @private Only Admin
*/
exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`A user with the id: ${req.params.id} was not found.`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/** Create User
 * @route /api/v1/auth/users
 * @method POST
 * @private Only Admin
*/
exports.createUser = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: newUser
  })
});

/** Update User
 * @route /api/v1/auth/users/:id
 * @method PUT
 * @private Only Admin
*/
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

/** Delete User
 * @route /api/v1/auth/users/:id
 * @method DELETE
 * @private Only Admin
*/
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: "User deleted."
  });
});
