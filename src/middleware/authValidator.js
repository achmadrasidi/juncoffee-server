const jwt = require("jsonwebtoken");
const { client } = require("../config/redis");
const { ErrorHandler } = require("./errorHandler.js");

const checkToken = (req, _res, next) => {
  const bearerToken = req.header("Authorization");

  if (!bearerToken) {
    next({ status: 401, message: "Please Login First" });
    return;
  }

  const token = bearerToken.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, { issuer: process.env.JWT_ISSUER }, async (err, payload) => {
    if (err && err.name === "TokenExpiredError") {
      next({ status: 403, message: "Please Login Again" });
      return;
    }
    if (err) {
      next({ status: 401, message: "Token Unauthorize, Please login again" });
      return;
    }
    try {
      const cachedToken = await client.get(`jwt${payload.id}`);
      if (!cachedToken) {
        throw new ErrorHandler({ status: 403, message: "Please Login First" });
      }

      if (cachedToken !== token) {
        throw new ErrorHandler({ status: 403, message: "Token Unauthorize, please login again" });
      }
      req.userPayload = payload;
      next();
    } catch (error) {
      const status = error.status ? error.status : 500;
      next({ status, message: error.message });
    }
  });
};

const checkRole = (role) => (req, _res, next) => {
  if (!req.userPayload) {
    next({ status: 500, message: "Something went wrong when trying to retrieve the user from the request" });
    return;
  }
  const roleRules = { admin: "user", user: "user" };

  if (req.userPayload.role === role || roleRules[req.userPayload.role] === role) {
    next();
    return;
  }

  next({ status: 403, message: `You dont have access, for ${role} only` });
};

const emailToken = (req, _res, next) => {
  const { token } = req.params;
  jwt.verify(token, process.env.JWT_SECRET_CONFIRM_KEY, async (err, payload) => {
    if (err) {
      next({ status: 403, message: "Your link expired, please register again." });
      return;
    }
    try {
      const cachedToken = await client.get(`jwt${payload.email}`);
      if (!cachedToken) {
        throw new ErrorHandler({ status: 403, message: "Your link expired,please register again" });
      }

      if (cachedToken !== token) {
        throw new ErrorHandler({ status: 403, message: "Token Unauthorize, please register again" });
      }
    } catch (error) {
      const status = error.status ? error.status : 500;
      next({ status, message: error.message });
    }
    req.userPayload = payload;
    next();
  });
};

const paymentToken = (req, _res, next) => {
  const { token } = req.params;

  jwt.verify(token, process.env.JWT_SECRET_PAYMENT_KEY, async (err, payload) => {
    if (err) {
      next({ status: 403, message: "Your link expired, please register again." });
      return;
    }
    try {
      const cachedToken = await client.get(`jwt${payload.t_id}`);
      if (!cachedToken) {
        throw new ErrorHandler({ status: 403, message: "Your link expired,please register again" });
      }

      if (cachedToken !== token) {
        throw new ErrorHandler({ status: 403, message: "Token Unauthorize, please register again" });
      }
    } catch (error) {
      const status = error.status ? error.status : 500;
      next({ status, message: error.message });
    }
    req.transactionPayload = payload;
    next();
  });
};

const isLoggedIn = (req, __res, next) => {
  const bearerToken = req.header("Authorization");
  if (!bearerToken) {
    next();
    return;
  }

  const token = bearerToken.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, { issuer: process.env.JWT_ISSUER }, async (err, payload) => {
    if (err) {
      next();
      return;
    }
    try {
      const cachedToken = await client.get(`jwt${payload.id}`);
      if (!cachedToken) {
        next();
        return;
      }
      if (!cachedToken || cachedToken !== token) {
        next();
        return;
      }

      throw new ErrorHandler({ status: 403, message: "You Already Logged In" });
    } catch (errors) {
      const status = errors.status ? errors.status : 500;
      next({ status, message: errors.message });
    }
  });
};

const removeAccess = async (id) => {
  try {
    const cachedLogin = await client.get(`jwt${id}`);
    if (cachedLogin) {
      await client.del(`jwt${id}`);
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = { checkToken, checkRole, removeAccess, isLoggedIn, emailToken, paymentToken };
