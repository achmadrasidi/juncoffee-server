const { db } = require("../config/db.js");
const bcrypt = require("bcrypt");
const { ErrorHandler } = require("../middleware/errorHandler");

const getUserById = async (req) => {
  try {
    const route = req.path;
    let id;
    let sqlQuery;
    switch (route) {
      case `/detail/${req.params.id}`:
        id = req.params.id;
        sqlQuery =
          "SELECT id,name,first_name,last_name,email,phone_number,address,image,role,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth,gender,to_char(last_order::timestamp,'Dy DD Mon YYYY HH24:MI') AS last_order,gender,to_char(created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at, to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at FROM users WHERE id = $1";
        break;
      case "/profile":
        id = req.userPayload.id;
        sqlQuery =
          "with u as(select name,first_name,last_name,email,phone_number,address,image,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth,gender FROM users WHERE id = $1),t as(select count(*) as total_order from transactions where user_id = $1) select * from t,u";
        break;
      default:
        id = req.userPayload.id;
        sqlQuery = "SELECT image,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth FROM users WHERE id = $1";
    }

    const result = await db.query(sqlQuery, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "User Not Found" });
    }
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getUserHistory = async (id) => {
  try {
    let sqlQuery =
      "select t.id as transaction_id,p.image, p.name as name_product, p.price, tp.quantity, t.order_status, t.total_price from transaction_items tp join transactions t on tp.transaction_id  = t.id join products p  on p.id = tp.product_id join users u on t.user_id = u.id where tp.transaction_id in(select id from transactions where user_id=$1 and on_delete=false)";
    const result = await db.query(sqlQuery, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "No History Found" });
    }
    return {
      total: result.rowCount,
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getUsers = async (query) => {
  const { keyword, email, gender, order, sort, limit, page = 1 } = query;
  try {
    let params = [];
    let totalParams = [];
    let totalQuery = "SELECT count(*) AS total FROM users ";
    let sqlQuery =
      "SELECT id,name,email,phone_number,address,date_of_birth,gender,last_order,image,role,created_at,updated_at FROM(select id,name,email,phone_number,address,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth,date_of_birth AS birthday,image,gender,to_char(last_order::timestamp,'Dy DD Mon YYYY HH24:MI') AS last_order,role,to_char(created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at, created_at AS date,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at FROM users) ug ";

    if (keyword && !email && !gender) {
      sqlQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') OR lower(address) LIKE lower('%' || $1 || '%')";
      totalQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') OR lower(address) LIKE lower('%' || $1 || '%')";
      params.push(keyword);
      totalParams.push(keyword);
    }

    if (email && !keyword && !gender) {
      sqlQuery += " WHERE lower(email) = lower($1)";
      totalQuery += " WHERE lower(email) = lower($1)";
      params.push(email);
      totalParams.push(email);
    }

    if (gender && !keyword && !email) {
      sqlQuery += " WHERE lower(gender) = lower($1)";
      totalQuery += " WHERE lower(gender) = lower($1)";
      params.push(gender);
      totalParams.push(gender);
    }

    if (gender && email && !keyword) {
      sqlQuery += " WHERE lower(email) = lower($2) AND lower(email) = lower($1)";
      totalQuery += " WHERE lower(email) = lower($2) AND lower(gender) = lower($1)";
      params.push(gender, email);
      totalParams.push(gender, email);
    }

    if (keyword && email && !gender) {
      sqlQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') AND lower(email) = lower($2) ";
      totalQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') AND lower(email) = lower($2) ";
      params.push(keyword, email);
      totalParams.push(keyword, email);
    }

    if (keyword && gender && !email) {
      sqlQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') AND lower(gender) = lower($2) ";
      totalQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') AND lower(gender) = lower($2) ";
      params.push(keyword, gender);
      totalParams.push(keyword, gender);
    }

    if (keyword && gender && email) {
      sqlQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') AND lower(email) = lower($3) AND lower(gender) = lower($2) ";
      totalQuery += " WHERE lower(name) LIKE lower('%' || $1 || '%') AND lower(email) = lower($3) AND lower(gender) = lower($2) ";
      params.push(keyword, gender, email);
      totalParams.push(keyword, gender, email);
    }
    if (order) {
      switch (order) {
        case "asc":
          sqlQuery += " ORDER BY " + sort + " asc";
          break;
        case "desc":
          sqlQuery += " ORDER BY " + sort + " desc";
          break;
        default:
          throw new ErrorHandler({ status: 400, message: "Order must be asc or desc" });
      }
    }

    if (limit) {
      const offset = (Number(page) - 1) * Number(limit);
      sqlQuery += " LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
      params.push(Number(limit), Number(offset));
    }
    const result = await db.query(sqlQuery, params);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "User Not Found" });
    }

    const dataUsers = await db.query(totalQuery, totalParams);
    const total = dataUsers.rows[0].total;

    return {
      totalUser: Number(total),
      totalPage: limit ? Math.ceil(Number(total) / limit) : 1,
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const createUser = async (body) => {
  const { name, email, password, phone_number, address, date_of_birth, gender, role } = body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const query =
      "INSERT INTO users(name,email,password,phone_number,address,date_of_birth,gender,role) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING  id,name,email,password,phone_number,address,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth,gender,to_char(created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at";
    const result = await db.query(query, [name, email, hashedPassword, phone_number, address, date_of_birth, gender, role]);
    return { data: result.rows[0], message: "User Successfully Created" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const updateUserProfile = async (body, id, image) => {
  const { name, email, phone_number, address, date_of_birth, gender, first_name, last_name } = body;
  try {
    const query =
      "UPDATE users SET name = COALESCE(NULLIF($1, ''), name),first_name = COALESCE(NULLIF($9, ''), first_name),last_name = COALESCE(NULLIF($10, ''), last_name), email = COALESCE(NULLIF($2, ''), email),phone_number = COALESCE(NULLIF($3, ''), phone_number),address = COALESCE(NULLIF($4, ''), address),date_of_birth = COALESCE(NULLIF($5, '')::date, date_of_birth),gender = COALESCE(NULLIF($6, ''), gender),image = COALESCE(NULLIF($8, ''), image), updated_at = now() WHERE id = $7 RETURNING name,first_name,last_name,email,phone_number,address,role,image,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at  ";
    const result = await db.query(query, [name, email, phone_number, address, date_of_birth, gender, id, image, first_name, last_name]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "User Not Found" });
    }
    return { data: result.rows[0], message: "Your Profile Successfully Updated" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const updateUserPassword = async ({ oldPassword, newPassword }, id) => {
  try {
    const oldQuery = "SELECT password from users WHERE id = $1";
    const oldResult = await db.query(oldQuery, [id]);
    const oldPass = oldResult.rows[0].password;
    const checkPassword = await bcrypt.compare(oldPassword, oldPass);
    if (!checkPassword) {
      throw new ErrorHandler({ status: 400, message: "Wrong Old Password" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    const query = "UPDATE users SET password = $1 , updated_at = now() WHERE id = $2 RETURNING id,name,email,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at ";
    const result = await db.query(query, [hashedNewPassword, id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "User Not Found" });
    }
    return { data: result.rows[0], message: "Your Password Successfully Updated" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const updateForgotPass = async ({ newPassword, email }) => {
  try {
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    const query = "UPDATE users SET password = $1 , updated_at = now() WHERE email = $2 RETURNING id,name,email,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at ";
    const result = await db.query(query, [hashedNewPassword, email]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "User Not Found" });
    }
    return { data: result.rows[0], message: "Your Password Successfully Recovered" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const deleteUser = async (req) => {
  try {
    const route = req.path;
    let id;
    switch (route) {
      case "/delete/":
        id = req.userPayload.id;
        break;
      case `/${req.params.id}`:
        id = req.params.id;
        break;
      default:
        throw new ErrorHandler({ status: 404, message: "Route Not Found" });
    }
    const query = "DELETE FROM users WHERE id = $1 RETURNING id,name,email,password,phone_number,address,image,to_char(date_of_birth,'dd-mm-yyyy') AS date_of_birth,gender";
    const result = await db.query(query, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "User Not Found" });
    }
    const successMessage = route === "/delete/" ? "Your Account has been Deleted" : "User Successfully Deleted";
    return { data: result.rows[0], message: successMessage };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const deleteAllUserHistory = async (id) => {
  try {
    const query = "UPDATE transactions set on_delete=true,deleted_at=now() WHERE user_id = $1 RETURNING *";
    const result = await db.query(query, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Transaction Not Found" });
    }
    return { data: result.rows[0] };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const deleteSingleUserHistory = async (itemId) => {
  try {
    let params = [];
    let queryParams = [];
    let query = "UPDATE transactions set on_delete=true,deleted_at=now() WHERE id IN ( ";
    itemId.split(",").map((val) => {
      queryParams.push(`$${params.length + 1}`, ",");
      params.push(val);
    });
    queryParams.pop();
    query += queryParams.join("");
    query += ") RETURNING *";

    const result = await db.query(query, params);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Transaction Not Found" });
    }
    return { data: result.rows[0] };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

module.exports = {
  getUserById,
  createUser,
  deleteUser,
  updateUserProfile,
  updateUserPassword,
  getUsers,
  getUserHistory,
  deleteAllUserHistory,
  deleteSingleUserHistory,
  updateForgotPass,
};
