const { getUserByEmail } = require("../models/authModel.js");
const { ErrorHandler } = require("./errorHandler.js");

const duplicateValidator = async (req, _res, next) => {
  try {
    const result = await getUserByEmail(req.body.email);
    if (result.rowCount) {
      throw new ErrorHandler({ status: 400, message: "Email is Already in use" });
    }
    next();
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    next({ status, message });
  }
};

const valueValidator = (req, _res, next) => {
  let obj;

  const { query, body, params } = req;
  const queryLength = Object.keys(query).length;
  const bodyLength = Object.keys(body).length;

  const method = req.method;
  if (queryLength) {
    obj = query;
  } else if (bodyLength) {
    obj = body;
  } else {
    obj = params;
  }

  let valid = true;
  let error;

  for (const key in obj) {
    const value = obj[key];
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const phoneFormat = /^\d{12}$/;
    const numberFormat = /^\d+$/;
    const dateFormat = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    const numberItem = ["id", "stock", "category_id", "discount", "product_id", "user_id", "quantity", "delivery_id", "minPrice", "maxPrice", "limit", "number"];
    const sortItem = ["id", "date", "birthday", "name", "price", "total_price", "discount", "name", "product_name", "expired", "quantity"];

    if (numberItem.includes(key)) {
      Number(value);
      if (!value.match(numberFormat)) {
        valid = false;
        error = "Invalid Number Format";
      }
    }

    if (value === "" && method !== "PATCH") {
      valid = false;
      error = "Input cannot be empty";
    }

    if (key === "date_of_birth" || key === "expired_date") {
      if (!value.match(dateFormat)) {
        valid = false;
        error = "Invalid Date Format";
      }
    }

    if (key === "email") {
      if (!value.match(emailFormat)) {
        valid = false;
        error = "Invalid Email Format";
      }
    }

    if (key === "phone_number") {
      Number(value);
      if (!value.match(phoneFormat)) {
        valid = false;
        error = "Invalid Phone Format";
      }
    }

    if (key === "gender") {
      if (value.toLowerCase() !== "male" && value.toLowerCase() !== "female") {
        valid = false;
        error = "gender must be male or female";
      }
    }

    if (key === "order_status") {
      if (value.toLowerCase() !== "paid" && value.toLowerCase() !== "not paid") {
        valid = false;
        error = "order status must be paid or not paid";
      }
    }

    if (key === "delivery_method") {
      if (value.toLowerCase() !== "dine in" && value.toLowerCase() !== "door delivery") {
        valid = false;
        error = "delivery_method must be dine in or door delivery";
      }
    }

    if (key === "category") {
      const listCategory = ["foods", "coffee", "non-coffee"];
      if (!listCategory.includes(value.toLowerCase())) {
        valid = false;
        error = "category must be foods,coffee,non-coffee";
      }
    }

    if (key === "sort") {
      if (!sortItem.includes(value)) {
        valid = false;
        error = "Invalid Sort value ";
      }
    }
  }

  if (!valid) {
    next({ status: 400, message: error });
    return;
  }
  next();
};

module.exports = { valueValidator, duplicateValidator };
