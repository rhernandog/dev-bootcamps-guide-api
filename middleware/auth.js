const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");

/** Protect Routes
 * 
*/
exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Check token exists
  if (!token) {
    next(new ErrorResponse("You're not authorized to access this section", 401));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Get the user ID from the token, find that user
    // and add it to the request object
    req.user = await User.findById(decodedToken.id);
    next();
  } catch (err) {
    next(new ErrorResponse("You're not authorized to access this section", 401));
  }
});

/** Users Roles
 * 
*/
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(`User role ${req.user.role} is not authorized to access this route.`, 403)
    );
  }
  next();
};
