const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateUserDetails,
  updateUserPassword,
} = require("../controllers/auth");
const { protectRoute } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protectRoute, updateUserDetails);
router.put("/updatepassword", protectRoute, updateUserPassword);

module.exports = router;
