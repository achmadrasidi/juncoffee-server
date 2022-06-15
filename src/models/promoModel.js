const { db } = require("../config/db.js");
const { ErrorHandler } = require("../middleware/errorHandler.js");

const getPromoById = async (id) => {
  try {
    const result = await db.query(
      "SELECT p.id,p.name,prod.name AS product_name,prod.price AS price,p.description,p.discount,to_char(p.expired_date,'Dy DD Mon YYYY') AS expired_date,p.coupon_code,p.image,c.name AS category,to_char(p.created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at,to_char(p.updated_at,'Dy DD Mon YYYY HH24:MI') AS updated_at FROM promos p JOIN products prod ON p.product_id = prod.id JOIN category c ON p.category_id = c.id WHERE p.id = $1",
      [id]
    );
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Promo Not Found" });
    }
    return {
      data: result.rows[0],
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const getPromos = async (query) => {
  const { keyword, coupon_code, category, product_name, order, sort, limit = 3, page = 1 } = query;
  try {
    const queryProperty = Object.keys(query);
    let filterQuery = [];
    let params = [];
    let sqlQuery =
      "SELECT count(*) over() as total,id,product_id,name,product_name,price,description,discount,coupon_code,expired_date,image,category FROM (SELECT p.id,p.product_id,p.name,prod.name as product_name ,prod.price AS price,p.description,p.discount,p.image,to_char(p.expired_date,'Dy DD Mon YYYY') AS expired_date,expired_date AS expired,p.created_at,p.coupon_code,c.name AS category FROM promos p JOIN products prod on p.product_id = prod.id JOIN category c on p.category_id = c.id) promo order by promo.created_at desc";

    const queryList = ["keyword", "coupon_code", "category", "product_name"];
    const queryFilter = queryProperty.filter((val) => queryList.includes(val));
    const filterLength = queryFilter.length;

    if (filterLength) {
      sqlQuery += " WHERE";
      for (const key of queryFilter) {
        switch (key) {
          case "keyword":
            filterQuery.push(` lower(name) LIKE lower('%' || $${params.length + 1} || '%')`, " AND");
            params.push(keyword);
            break;
          case "coupon_code":
            filterQuery.push(` lower(coupon_code) = lower($${params.length + 1})`, " AND");
            params.push(coupon_code);
            break;
          case "category":
            filterQuery.push(` lower(category) = lower($${params.length + 1})`, " AND");
            params.push(category);
            break;
          case "product_name":
            filterQuery.push(` lower(product_name) = lower($${params.length + 1})`, " AND");
            params.push(product_name);
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
      const sortItems = ["discount", "price", "expired"];
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
      throw new ErrorHandler({ status: 404, message: "Promo Not Found" });
    }
    const total = result.rows[0].total;

    return {
      totalPromo: Number(total),
      totalPage: Math.ceil(Number(total) / limit),
      data: result.rows,
    };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const createPromo = async (body, image) => {
  const { name, description, discount, expired_date, category_id, product_id, coupon_code } = body;

  try {
    const query =
      "INSERT INTO promos(name,description,discount,expired_date,category_id,product_id,coupon_code,image) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,name,description,discount,to_char(expired_date,'Dy DD Mon YYYY') AS expired_date,coupon_code,image,to_char(created_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS created_at";
    const result = await db.query(query, [name, description, discount, expired_date, category_id, product_id, coupon_code, image]);
    return { data: result.rows[0], message: "Promo Successfully Created" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const updatePromo = async (body, id, image) => {
  const { name, description, discount, expired_date, coupon_code, category_id, product_id } = body;
  try {
    const query =
      "UPDATE promos SET name = COALESCE(NULLIF($1, ''), name) , description = COALESCE(NULLIF($2, ''), description) , discount = COALESCE(NULLIF($3, '')::integer, discount) , expired_date = COALESCE(NULLIF($4, '')::date, expired_date) , coupon_code = COALESCE(NULLIF($5, ''), coupon_code),category_id = COALESCE(NULLIF($7, '')::integer, category_id),product_id = COALESCE(NULLIF($8, '')::integer, product_id),image = COALESCE(NULLIF($9, ''), image), updated_at = now()  WHERE id = $6 RETURNING id,name,description,discount,to_char(expired_date,'Dy DD Mon YYYY') AS expired_date,coupon_code,image,to_char(updated_at::timestamp,'Dy DD Mon YYYY HH24:MI') AS updated_at ";
    const result = await db.query(query, [name, description, discount, expired_date, coupon_code, id, category_id, product_id, image]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Promo Not Found" });
    }
    return { data: result.rows[0], message: "Promo Successfully Updated" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

const deletePromo = async (id) => {
  try {
    const query = "DELETE FROM promos WHERE id = $1 RETURNING id,name,description,image,discount,to_char(expired_date,'Dy DD Mon YYYY'),coupon_code";
    const result = await db.query(query, [id]);
    if (!result.rowCount) {
      throw new ErrorHandler({ status: 404, message: "Promo Not Found" });
    }
    return { data: result.rows[0], message: "Promo Successfully Deleted" };
  } catch (err) {
    throw new ErrorHandler({ status: err.status ? err.status : 500, message: err.message });
  }
};

module.exports = { getPromos, createPromo, getPromoById, updatePromo, deletePromo };
