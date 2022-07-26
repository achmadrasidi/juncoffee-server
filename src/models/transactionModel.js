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

const findTransaction = async () => {
  try {
    let sqlQuery =
      "select td.id as item_id,t.user_id,t.id as transaction_id,u.email as user_email,p.name as product_name,p.image as image,td.quantity,size,td.price,t.shipping_address as address,t.total_price as total,t.order_status as status,t.subtotal,t.shipping_price,t.tax_price,t.payment_method from transaction_items td join transactions t on td.transaction_id = t.id join products p on td.product_id=p.id join users u on t.user_id=u.id where transaction_id in(SELECT id FROM transactions WHERE order_status = 'NOT PAID' and on_delete=false)";
    const result = await db.query(sqlQuery);
    if (result.rowCount === 0) {
      throw new ErrorHandler({ status: 404, error: "All Order has been PAID" });
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
  const { user_id, items, totalPrice, subtotal, address, payMethod, shipping, tax } = body;
  try {
    let userId = u_id;
    let params = [];
    let queryParams = [];
    if (!u_id) userId = user_id;

    const queryOrder = "INSERT INTO transactions(user_id,total_price,subtotal,shipping_address,payment_method,shipping_price,tax_price) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id";
    const order = await db.query(queryOrder, [userId, totalPrice, subtotal, address, payMethod, shipping, tax]);
    const orderId = order.rows[0].id;

    let orderItemQuery = "INSERT INTO transaction_items(product_id,transaction_id,quantity,price) VALUES";
    items.map((val) => {
      queryParams.push(`($${params.length + 1},$${params.length + 2},$${params.length + 3},$${params.length + 4})`, ",");
      params.push(val.id, orderId, val.quantity, val.price);
    });
    queryParams.pop();
    orderItemQuery += queryParams.join("");
    orderItemQuery += " RETURNING *";
    const result = await db.query(orderItemQuery, params);

    return { data: result.rows[0], message: "Transaction Successfully Created" };
  } catch (err) {
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
