const { db } = require("../config/db.js");
const { ErrorHandler } = require("../middleware/errorHandler.js");

const getProductById = async (id) => {
  try {
    const query =
      "SELECT p.id,p.name,p.price,p.description,p.stock,p.delivery_info,image,to_char(p.created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at,to_char(p.updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at,c.name AS category FROM products p JOIN category c ON p.category_id = c.id WHERE p.id = $1";
    const result = await db.query(query, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Product Not Found" });
    }
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getProductByFav = async (query) => {
  const { category, order, sort, limit = 12, page = 1 } = query;
  try {
    let params = [];
    let sqlQuery =
      "SELECT count(*) over() as total, id,name,price,description,stock,delivery_info,image,created_at,category from (select product_id AS id,p.name AS name,p.price AS price,p.description AS description,p.stock AS stock,p.delivery_info AS delivery_info,p.image,to_char(p.created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at, p.created_at AS date,c.name AS category from transaction_items t join products p on t.product_id = p.id join category c on p.category_id = c.id group by t.product_id,p.name,p.price,p.stock,p.description,p.delivery_info,p.image,p.created_at,c.name having count(*) > 6) AS fp";
    if (category) {
      sqlQuery += " WHERE lower(category) = lower($1)";
      params.push(category);
    }
    if (order) {
      sqlQuery += " ORDER BY ";
      const sortItems = ["price", "date", "name"];
      if (sortItems.includes(sort)) {
        sortItems.map((val) => {
          if (val === sort) {
            sqlQuery += val;
          }
        });
      }
      switch (order) {
        case "asc":
          sqlQuery += " asc";
          break;
        case "desc":
          sqlQuery += " desc";
          break;
        default:
          throw new ErrorHandler({ status: 400, message: "Order must be asc or desc" });
      }
    }

    const offset = (Number(page) - 1) * Number(limit);
    sqlQuery += " LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(Number(limit), Number(offset));

    const result = await db.query(sqlQuery, params);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Product Not Found" });
    }

    const total = result.rows[0].total;

    return {
      totalProduct: Number(total),
      totalPage: Math.ceil(Number(total) / limit),
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getProducts = async (query) => {
  const { keyword, category, minPrice, maxPrice, order, sort, limit = 12, page = 1 } = query;
  try {
    const queryProperty = Object.keys(query);
    let filterQuery = [];
    let params = [];
    let sqlQuery =
      "SELECT count(*) over() as total,id,name,price,description,stock,delivery_info,image,created_at,updated_at,category FROM (SELECT p.id,p.name,p.price,p.description,p.stock,p.delivery_info,p.image,to_char(p.created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at,created_at AS date,to_char(p.updated_at,'Dy DD Mon YYYY HH24:MI') AS updated_at,updated_at AS updated_date,c.name AS category FROM products p JOIN category c ON p.category_id = c.id) p ";

    const queryList = ["keyword", "category", "minPrice"];
    const queryFilter = queryProperty.filter((val) => queryList.includes(val));
    const filterLength = queryFilter.length;

    if (filterLength) {
      sqlQuery += " WHERE";
      for (const key of queryFilter) {
        switch (key) {
          case "keyword":
            filterQuery.push(" lower(name) LIKE lower('%' || $" + (params.length + 1) + " || '%')", " AND");
            params.push(keyword);
            break;
          case "category":
            filterQuery.push(" lower(category) = lower($" + (params.length + 1) + ")", " AND");
            params.push(category);
            break;
          case "minPrice":
            filterQuery.push(" price > $" + (params.length + 1) + " AND price < $" + (params.length + 2) + "", " AND");
            params.push(minPrice, maxPrice);
            break;
          default:
            throw new ErrorHandler({ status: 404, message: "key not found" });
        }
      }
      filterQuery.pop();
      sqlQuery += filterQuery.join("");
    }

    if (order) {
      sqlQuery += " ORDER BY ";
      const sortItems = ["price", "date", "name"];
      if (sortItems.includes(sort)) {
        sortItems.map((value) => {
          if (value === sort) {
            sqlQuery += value;
          }
        });
      }
      switch (order) {
        case "asc":
          sqlQuery += " asc";
          break;
        case "desc":
          sqlQuery += " desc";
          break;
        default:
          throw new ErrorHandler({ status: 400, message: "Order must be asc or desc" });
      }
    }

    const offset = (Number(page) - 1) * Number(limit);
    sqlQuery += " LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(Number(limit), Number(offset));

    const result = await db.query(sqlQuery, params);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Product Not Found" });
    }

    const total = result.rows[0].total;

    return {
      totalProduct: Number(total),
      totalPage: Math.ceil(Number(total) / limit),
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const createProduct = async (body, image) => {
  const { name, price, description, stock, delivery_info, category_id } = body;

  try {
    const query =
      "INSERT INTO products(name,price,description,stock,delivery_info,category_id,image) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,price,description,stock,delivery_info,image,to_char(created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at";
    const result = await db.query(query, [name, price, description, stock, delivery_info, category_id, image]);
    return { data: result.rows[0], message: "Product Successfully Created" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const updateProduct = async (body, id, image) => {
  const { name, price, description, stock, delivery_info, category_id } = body;
  try {
    const query =
      "UPDATE products SET name = COALESCE(NULLIF($1, ''), name), price = COALESCE(NULLIF($2, '')::money, price), description = COALESCE(NULLIF($3, ''), description), stock = COALESCE(NULLIF($4, '')::integer, stock), delivery_info = COALESCE(NULLIF($5, ''), delivery_info),category_id = COALESCE(NULLIF($6, '')::integer, category_id),image = COALESCE(NULLIF($8, ''), image), updated_at = now() WHERE id = $7 RETURNING id,name,price,description,stock,delivery_info,image,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at";
    const result = await db.query(query, [name, price, description, stock, delivery_info, category_id, id, image]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Product Not Found" });
    }
    return { data: result.rows[0], message: "Product Successfully Updated" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const deleteProduct = async (id) => {
  try {
    const query = "DELETE FROM products WHERE id = $1 RETURNING id,name,price,description,stock,delivery_info,image";
    const result = await db.query(query, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Product Not Found" });
    }
    return { data: result.rows[0], message: "Product Successfully Deleted" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByFav,
  createProduct,
  updateProduct,
  deleteProduct,
};
