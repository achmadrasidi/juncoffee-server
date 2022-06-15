const { db } = require("../config/db.js");
const { ErrorHandler } = require("../middleware/errorHandler");

const getOrderById = async (id) => {
  try {
    const query =
      "SELECT t.id,u.name AS user_name,p.name AS product_name,p.price AS product_price,t.shipping_address,t.quantity,t.subtotal,d.method AS delivery_method,t.shipping_price,t.tax_price,t.total_price,t.order_status,to_char(t.created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at,to_char(t.updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at FROM transactions t JOIN users u on t.user_id = u.id JOIN products p on t.product_id = p.id JOIN delivery d on t.delivery_id = d.id WHERE t.id = $1";
    const result = await db.query(query, [id]);
    if (result.rowCount === 0) {
      throw new ErrorHandler({ status: 404, message: "Transactions Not Found" });
    }
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const findTransaction = async (query) => {
  const { keyword, delivery_method, order_status, order, sort } = query;
  try {
    let parameterize = [];
    let sqlQuery =
      "SELECT id,user_name,product_name,product_price,shipping_address,quantity,subtotal,delivery_method,shipping_price,tax_price,total_price,created_at,order_status FROM(SELECT t.id,u.name AS user_name,p.name AS product_name,p.price AS product_price,t.shipping_address,t.quantity,t.subtotal,d.method AS delivery_method,t.shipping_price,t.tax_price,t.total_price,to_char(t.created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at,t.created_at AS date,t.order_status FROM transactions t JOIN users u on t.user_id = u.id JOIN products p on t.product_id = p.id JOIN delivery d on t.delivery_id = d.id) td";
    if (keyword || delivery_method || order_status) {
      sqlQuery +=
        " WHERE lower(order_status) = lower($3) OR lower(user_name) LIKE lower('%' || $1 || '%') OR lower(product_name) LIKE lower('%' || $1 || '%') OR lower(delivery_method) = lower($2) OR lower(order_status) LIKE lower('%' || $1 || '%')";
      parameterize.push(keyword, delivery_method, order_status);
    }
    if (order) {
      sqlQuery += " order by " + sort + " " + order;
    }
    const result = await db.query(sqlQuery, parameterize);
    if (result.rowCount === 0) {
      throw new ErrorHandler({ status: 404, error: "Transaction Not Found" });
    }
    return {
      total: result.rowCount,
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const transactionSummary = async () => {
  try {
    let sqlQuery = "SELECT date(created_at) AS order_date, SUM(total_price) rev FROM transactions t where date_part('day',created_at) between date_part('day',now())-6 and date_part('day',now()) GROUP by date(created_at)";
    const result = await db.query(sqlQuery);
    if (!result.rowCount) throw new ErrorHandler({ status: 404, message: "Transaction Not Found" });
    return {
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const createTransaction = async (body, u_id) => {
  const { user_id, items } = body;
  try {
    let userId = u_id;
    let params = [];
    let queryParams = [];
    if (!u_id) userId = user_id;
    const client = await db.connect();
    await client.query("BEGIN");

    const queryOrder = "INSERT INTO transactions(user_id) VALUES($1) RETURNING id";
    const order = await client.query(queryOrder, [userId]);
    const orderId = order.rows[0].id;

    let orderItemQuery = "INSERT INTO transaction_items(product_id,transaction_id,quantity,size,price) VALUES";
    items.map((val) => {
      return val.variant.map((cart) => {
        queryParams.push(`($${params.length + 1},$${params.length + 2},$${params.length + 3},$${params.length + 4},$${params.length + 5})`, ",");
        params.push(val.id, orderId, cart.quantity, cart.size, cart.prodPrice);
      });
    });
    queryParams.pop();
    orderItemQuery += queryParams.join("");
    orderItemQuery += " RETURNING *";
    const result = await client.query(orderItemQuery, params);
    await client.query("COMMIT");
    return { data: result.rows[0], message: "Transaction Successfully Created" };
  } catch (err) {
    const client = await db.connect();
    await client.query("ROLLBACK");
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const updateTransaction = async (id) => {
  try {
    const query = "UPDATE transactions SET order_status = 'PAID', updated_at = now()  WHERE id = $1 RETURNING id,order_status,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at";
    const result = await db.query(query, [id]);
    if (result.rowCount === 0) {
      throw new ErrorHandler({ status: 404, message: "transaction Not Found" });
    }

    return { data: result.rows[0], message: "Transaction Successfully Updated" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const deleteTransaction = async (id) => {
  try {
    const query = "DELETE FROM transactions WHERE id = $1 RETURNING id,user_id,product_id,delivery_id,shipping_address,quantity,subtotal,tax_price,shipping_price,total_price,order_status";
    const result = await db.query(query, [id]);
    if (result.rowCount === 0) {
      throw new ErrorHandler({ status: 404, error: "Transaction Not Found" });
    }
    return { data: result.rows[0], message: "Transaction Successfully Deleted" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

module.exports = { getOrderById, createTransaction, findTransaction, updateTransaction, deleteTransaction, transactionSummary };
