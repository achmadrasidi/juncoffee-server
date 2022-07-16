const Router = require("express").Router();

const {
  getUserDetail,
  userHistory,
  editUser,
  editUserPassword,
  deleteUserById,
  searchUsers,
  addUser,
  createOrder,
  deleteAllHistory,
  deleteSingleHistory,
  forgotPassword,
  editForgotPassword,
  verifyOtp,
} = require("../controllers/userController.js");
const { userValidator, orderValidator } = require("../middleware/fieldValidator.js");
const { valueValidator } = require("../middleware/valueValidator.js");
const { checkToken, checkRole } = require("../middleware/authValidator.js");
const uploadFile = require("../middleware/fileUpload.js");

// USER
// get user history
Router.get("/history/", checkToken, checkRole("user"), userHistory);
// get user profile
Router.get("/profile/", checkToken, checkRole("user"), getUserDetail);
// check otp forgor password
Router.get("/verify-forgot/:confirmCode", verifyOtp);
// user forgot password
Router.get("/forgot-password/:email", forgotPassword);
//edit user forgot password
Router.patch("/forgot-password/", editForgotPassword);
// post create new order user
Router.post("/new-order/", checkToken, checkRole("user"), valueValidator, orderValidator, createOrder);
// edit user detail
Router.patch("/edit-profile/", checkToken, checkRole("user"), valueValidator, uploadFile, userValidator, editUser);
// edit user password
Router.patch("/edit-password/", checkToken, checkRole("user"), valueValidator, userValidator, editUserPassword);

// delete user account
Router.delete("/delete/", checkToken, checkRole("user"), deleteUserById);
// delete all user history
Router.delete("/history/", checkToken, checkRole("user"), deleteAllHistory);
// delete single user history
Router.delete("/history/:id", checkToken, checkRole("user"), deleteSingleHistory);

// ADMIN
// get all users, search users
Router.get("/", checkToken, checkRole("admin"), valueValidator, userValidator, searchUsers);
// get user detail by id
Router.get("/detail/:id", checkToken, checkRole("admin"), valueValidator, getUserDetail);
// add new user
Router.post("/", checkToken, checkRole("admin"), valueValidator, userValidator, addUser);
// delete user by id
Router.delete("/:id", checkToken, checkRole("admin"), valueValidator, deleteUserById);

module.exports = Router;
