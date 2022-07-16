const { getPassByEmail, registerUser, verifyEmail, verifyPayment } = require("../models/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { removeAccess } = require("../middleware/authValidator");
const { userStorage } = require("../config/cache");
const { client } = require("../config/redis");
const { ErrorHandler } = require("../middleware/errorHandler");
const { sendConfirmationEmail } = require("../config/nodemailer");

const register = async (req, res) => {
  try {
    const { file } = req;
    let image = null;
    if (file) {
      image = file.path.replace("public", "").replace(/\\/g, "/");
      const imageDirCache = image.split("/")[3].split(".")[0];
      const imageCache = image.split("/")[3];
      userStorage.setItem(imageDirCache, imageCache);
    }
    const { data } = await registerUser(req.body, image);
    const token = jwt.sign({ email: data.email }, process.env.JWT_SECRET_CONFIRM_KEY, { expiresIn: "1h" });
    await client.set(`jwt${data.email}`, token);

    await sendConfirmationEmail(data.email, data.email, token);

    res.status(201).json({
      message: "Register Success, Please check your email for verification.",
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data } = await getPassByEmail(email);
    const result = await bcrypt.compare(password, data.password);

    if (!result) {
      throw new ErrorHandler({ status: 400, message: "Invalid Email or Password" });
    }
    if (data.status !== "active") {
      throw new ErrorHandler({ status: 403, message: "Pending Account. Please Verify Your Email" });
    }

    const payload = {
      id: data.id,
      email,
      role: data.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { issuer: process.env.JWT_ISSUER, expiresIn: "30d" });

    await client.set(`jwt${data.id}`, token);
    res.status(200).json({
      id: data.id,
      email,
      token,
      image: data.image,
      address: data.address,
      phone_number: data.phone_number,
      role: data.role,
      message: "Login Successful",
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const logout = async (req, res) => {
  try {
    await removeAccess(req.userPayload.id);

    res.status(200).json({
      message: "You have successfully logged out",
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { email } = req.userPayload;
    await verifyEmail(email);

    res.status(200).json({
      message: "Your Email has been verified. Please Login",
    });
  } catch (err) {
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: err.message,
    });
  }
};

const paymentConfirm = async (req, res) => {
  try {
    const data = await verifyPayment(req.transactionPayload);
    const { t_id } = req.transactionPayload;
    await client.del(`jwt${t_id}`);
    res.json({
      data,
      message: "Your Payment has been confirmed, Thanks for shopping with Juncoffee !",
    });
  } catch (err) {
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: err.message,
    });
  }
};

module.exports = { register, login, logout, confirmEmail, paymentConfirm };
