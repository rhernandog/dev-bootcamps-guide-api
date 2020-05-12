const express = require("express");
const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/auth");
const { protectRoute } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router
  .route("/me")
  .get(protectRoute, getMe);

module.exports = router;
