const Router = require("express").Router();
const { register, login, logout, confirmEmail, paymentConfirm } = require("../controllers/authController.js");
const { userValidator } = require("../middleware/fieldValidator.js");
const { valueValidator, duplicateValidator } = require("../middleware/valueValidator.js");
const { checkToken, checkRole, isLoggedIn, emailToken, paymentToken } = require("../middleware/authValidator");
const uploadFile = require("../middleware/fileUpload");

Router.post("/register", isLoggedIn, valueValidator, uploadFile, userValidator, duplicateValidator, register);
Router.get("/confirm/:token", emailToken, confirmEmail);
Router.get("/payment/:token", checkToken, paymentToken, paymentConfirm);
Router.post("/login", isLoggedIn, valueValidator, userValidator, login);
Router.delete("/logout", checkToken, checkRole("user"), logout);

module.exports = Router;
