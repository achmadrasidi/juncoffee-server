const { getUserById, getUsers, createUser, deleteUser, updateUserProfile, updateUserPassword, getUserHistory, deleteAllUserHistory, deleteSingleUserHistory, updateForgotPass } = require("../models/userModel.js");
const { createTransaction } = require("../models/transactionModel");
const { removeAccess } = require("../middleware/authValidator");
const { sendConfirmationPayment, sendPasswordConfirmation } = require("../config/nodemailer.js");
const jwt = require("jsonwebtoken");
const { client } = require("../config/redis.js");
const generator = require("generate-password");

const getUserDetail = async (req, res) => {
  try {
    const { data } = await getUserById(req);

    res.status(200).json({
      data,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { totalUser, totalPage, data } = await getUsers(req.query);
    const { page = 1, limit } = req.query;
    const queryProp = Object.keys(req.query);
    let pageQuery = "?page=";
    let limitQuery = `&limit=${limit}`;
    let route = "";

    const re = new RegExp(`\&page=${page}`);
    const reg = new RegExp(`\&limit=${limit}`);

    if (queryProp.length) {
      route = req._parsedUrl.search.replace(/\?/g, "&").replace(re, "").replace(reg, "");
    }

    const currentPage = Number(page);
    const nextPage = `/user${pageQuery}${Number(page) + 1}${limitQuery}${route}`;
    const prevPage = `/user${pageQuery}${Number(page) - 1}${limitQuery}${route}`;

    const meta = {
      totalUser,
      totalPage,
      currentPage,
      nextPage: currentPage === Number(totalPage) ? null : nextPage,
      prevPage: currentPage === 1 ? null : prevPage,
    };

    res.status(200).json({
      meta,
      data,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { data } = await createTransaction(req.body, req.userPayload.id);
    const { email, items, totalPrice, payMethod, subtotal, address, shipping, tax } = req.body;

    const payload = {
      t_id: data.transaction_id,
      totalPrice,
      subtotal,
      address,
      shipping,
      tax,
      payMethod,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_PAYMENT_KEY, { issuer: process.env.JWT_ISSUER, expiresIn: "1h" });
    await client.set(`jwt${data.transaction_id}`, token);
    await sendConfirmationPayment(email, email, items, totalPrice, payMethod, token);
    res.status(201).json({
      data,
      message: "Your order has been processed,Please check your email to confirm your payment",
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const userHistory = async (req, res) => {
  try {
    const { total, data } = await getUserHistory(req.userPayload.id);
    res.status(200).json({
      total,
      data,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const addUser = async (req, res) => {
  try {
    const { data, message } = await createUser(req.body);

    res.status(201).json({
      data,
      message,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const editUser = async (req, res) => {
  try {
    const { file } = req;
    let image = "";

    if (file) {
      image = file.path;
    }
    const { data, message } = await updateUserProfile(req.body, req.userPayload.id, image);
    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const editUserPassword = async (req, res) => {
  try {
    const { data, message } = await updateUserPassword(req.body, req.userPayload.id);

    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const editForgotPassword = async (req, res) => {
  try {
    const { data, message } = await updateForgotPass(req.body);

    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.params;
    const confirmCode = generator.generate({
      length: 6,
      numbers: true,
    });

    await sendPasswordConfirmation(email, email, confirmCode);
    await client.set(`forgotpass${confirmCode}`, confirmCode);
    res.status(200).json({
      message: "Please check your email for your OTP password confirmation",
    });
  } catch (error) {
    const { message, status } = error;
    res.status(status ? status : 500).json({
      error: message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { confirmCode } = req.params;
    const confirm = await client.get(`forgotpass${confirmCode}`);
    if (confirm !== confirmCode) {
      res.status(403).json({ error: "Invalid OTP Code !" });
      return;
    }
    await client.del(`forgotpass${confirmCode}`);

    res.status(200).json({
      message: "OTP Code Accepted, Please reset your password",
    });
  } catch (error) {
    const { message, status } = error;
    res.status(status ? status : 500).json({
      error: message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { data, message } = await deleteUser(req);
    const path = req.path;
    if (path === "/delete/") {
      removeAccess(req.userPayload.id);
    }

    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const deleteAllHistory = async (req, res) => {
  try {
    const { data } = await deleteAllUserHistory(req.userPayload.id);

    res.status(200).json({
      data,
      message: "Your Transaction(s) has been deleted",
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const deleteSingleHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await deleteSingleUserHistory(id);

    res.status(200).json({
      data,
      message: "Your Transaction(s) has been deleted",
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

module.exports = {
  getUserDetail,
  searchUsers,
  userHistory,
  createOrder,
  addUser,
  deleteUserById,
  editUser,
  editUserPassword,
  deleteAllHistory,
  deleteSingleHistory,
  forgotPassword,
  editForgotPassword,
  verifyOtp,
};
