const express = require("express");
const advancedResults = require("../middleware/advancedResults");
const { protectRoute, authorize } = require("../middleware/auth");
const User = require("../models/User");
const {
  getAllUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const router = express.Router();
router.use(protectRoute);
router.use(authorize("admin"));

router
  .route("/")
  .get(advancedResults(User), getAllUsers)
  .post(createUser);
router
  .route("/:id")
  .get(getSingleUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
