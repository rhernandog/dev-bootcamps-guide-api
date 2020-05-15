const crypto = require("crypto");
const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");

/** Register User
 * @route /api/v1/auth/register
 * @public
*/
exports.registerUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    role,
    password
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    role,
    password
  });
  // Create a token for the user
  const token = newUser.getJwtToken();
  res
    .status(200)
    .cookie("token", token, createCookieOptions())
    .json({
      success: true,
      data: newUser,
      token
    });
});

/** Login User
 * @route /api/v1/auth/login
 * @public
*/
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Validate data
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password.", 400));
  }
  // Check for the user
  const logUser = await User.findOne({ email }).select("+password");
  if (!logUser) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  // Check password matches
  const passwordMatches = await logUser.matchPassword(password);
  if (!passwordMatches) {
    return next(new ErrorResponse("The provided password is incorrect.", 401));
  }

  // If the login information is correct, send the user session token
  const token = logUser.getJwtToken();

  res
    .status(200)
    .cookie("token", token, createCookieOptions())
    .json({
      success: true,
      token
    });
});

/** Get Current Logged User
 * @route /api/v1/auth/me
 * @method GET
 * @private
*/
exports.getMe = asyncHandler(async (req, res, next) => {
  const loggedUser = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: loggedUser
  });
});

/** Update User Details
 * @route /api/v1/auth/updatedetails
 * @method PUT
 * @private
*/
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const updateDetails = {
    name: req.body.name,
    email: req.body.email
  };
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateDetails, {
    runValidators: true,
    new: true
  });
  if (!updatedUser) {
    return next(new ErrorResponse("Cannot update user details.", 500));
  }
  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

/** Update User Password
 * @route /api/v1/auth/updatepassword
 * @method PUT
 * @private
*/
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  // Get the user with the password
  const udpatedUser = await User.findById(req.user.id).select("+password");
  // Check that the provided current password matches
  // the one in the database
  if (!(await udpatedUser.matchPassword(req.body.password))) {
    return next(new ErrorResponse("The provided password is incorrect.", 401));
  }
  // Update the user password with the new password provided
  udpatedUser.password = req.body.newPassword
  await udpatedUser.save({
    runValidators: true
  });

  // If the login information is correct, send the user session token
  const token = udpatedUser.getJwtToken();

  res
    .status(200)
    .cookie("token", token, createCookieOptions())
    .json({
      success: true,
      data: "User password updated.",
      token
    });
});

/** Forgot Password Handler
 * @route /api/v1/auth/forgotpassword
 * @method POST
 * @public
*/
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const targetUser = await User.findOne(req.body);

  if (!targetUser) {
    return next(new ErrorResponse("Cannot find a user with the provided email.", 404));
  }

  // Get reset token
  const resetToken = await targetUser.getResetPasswordToken();

  // Update the user in the database
  await targetUser.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/resetpassword/${resetToken}`;

  const emailMessage = `You're receiving this email because you requested to reset your password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    console.log("sending reset email");
    await sendEmail({
      email: targetUser.email,
      subject: "Reset your DevCamper password",
      message: emailMessage
    });
    console.log("reset email has been sent!!!");
    return res.status(200).json({
      success: true,
      data: "Password reset email sent"
    });
  } catch (err) {
    console.log(err);
    // If there is an error in the process, reset the password token to undefined
    targetUser.resetPasswordToken = undefined;
    targetUser.resetPasswordExpire = undefined;

    await targetUser.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Cannot send email to reset password.", 500));
  }

  res.status(200).json({
    success: true,
    data: targetUser
  });
});

/** Reset Password Handler
 * @route /api/v1/auth/resetpassword/:resettoken
 * @method PUT
 * @public
*/
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get the token and hash it
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  // Get the user with this token in the database
  const targetUser = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!targetUser) {
    return next(new ErrorResponse("Invalid reset password token.", 400));
  }
  // The user exists and the reset token is still valid,
  // use the password provided in the request
  targetUser.password = req.body.password;
  targetUser.resetPasswordToken = undefined;
  targetUser.resetPasswordExpire = undefined;
  await targetUser.save({ validateBeforeSave: true });

  // Send the user session token
  const token = targetUser.getJwtToken();

  res
    .status(200)
    .cookie("token", token, createCookieOptions())
    .json({
      success: true,
      token
    });
});

const createCookieOptions = () => {
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 3600000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") {
    optiosn.secure = true;
  }

  return options;
};
