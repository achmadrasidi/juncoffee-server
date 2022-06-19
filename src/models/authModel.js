const { db } = require("../config/db.js");
const { ErrorHandler } = require("../middleware/errorHandler");
const bcrypt = require("bcrypt");

const registerUser = async (body, image) => {
  const { name, address, date_of_birth, gender, email, password, phone_number } = body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const query =
      "INSERT INTO users(email,password,phone_number,role,name,address,date_of_birth,gender,image) VALUES($1,$2,$3,'user',$4,$5,$6,$7,$8) RETURNING id,email,password,phone_number,to_char(created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at";
    const result = await db.query(query, [email, hashedPassword, phone_number, name, address, date_of_birth, gender, image]);
    return { data: result.rows[0], message: "User Successfully Created" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const verifyEmail = async (email) => {
  try {
    let sqlQuery = "UPDATE users SET status='active' WHERE email=$1 RETURNING *";
    const result = await db.query(sqlQuery, [email]);
    if (!result.rowCount) throw new ErrorHandler({ status: 404, message: "User Not Found" });
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getUserByEmail = async (email) => {
  try {
    return await db.query("SELECT email FROM users WHERE email = $1", [email]);
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getPassByEmail = async (email) => {
  try {
    const result = await db.query("SELECT id,password,role,image,status,address,phone_number FROM users WHERE email = $1", [email]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 400, message: "Invalid Email or Password" });
    }
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const verifyPayment = async (payload) => {
  try {
    const { t_id } = payload;
    let sqlQuery = "UPDATE transactions SET order_status='PAID' WHERE id = $1 RETURNING *  ";
    const result = await db.query(sqlQuery, [t_id]);
    if (!result.rowCount) throw new ErrorHandler({ status: 404, message: "Transaction Not Found" });
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

module.exports = { getPassByEmail, getUserByEmail, registerUser, verifyEmail, verifyPayment };
