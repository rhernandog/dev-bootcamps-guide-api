const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");

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
 * @private
*/
exports.getMe = asyncHandler(async (req, res, next) => {
  const loggedUser = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: loggedUser
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
