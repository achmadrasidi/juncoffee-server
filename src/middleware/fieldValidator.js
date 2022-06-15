const validatorHelper = require("../helper/validatorHelper.js");

const userValidator = (req, _res, next) => {
  const rules = ["email", "password", "phone_number"];
  const path = req.path;
  if (path === "/login") rules.pop();
  const { error, valid } = validatorHelper(req, rules);
  if (!valid) {
    next({ status: 400, message: error });
    return;
  }

  next();
};

const productValidator = (req, _res, next) => {
  const rules = ["name", "price", "description", "stock", "category_id"];
  const { error, valid } = validatorHelper(req, rules);
  if (!valid) {
    next({ status: 400, message: error });
    return;
  }

  next();
};

const promoValidator = (req, _res, next) => {
  const rules = ["name", "description", "discount", "expired_date", "coupon_code", "category_id", "product_id"];

  const { error, valid } = validatorHelper(req, rules);
  if (!valid) {
    next({ status: 400, message: error });
    return;
  }

  next();
};

const orderValidator = (req, _res, next) => {
  const rules = ["email"];
  const { error, valid } = validatorHelper(req, rules);
  if (!valid) {
    next({ status: 400, message: error });
    return;
  }

  next();
};

module.exports = { userValidator, productValidator, promoValidator, orderValidator };
