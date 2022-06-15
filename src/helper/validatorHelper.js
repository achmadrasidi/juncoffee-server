const validatorHelper = (req, rules) => {
  let obj;

  const { query, body, params } = req;
  const queryLength = Object.keys(query).length;
  const bodyLength = Object.keys(body).length;

  if (queryLength) {
    obj = query;
  } else if (bodyLength) {
    obj = body;
  } else {
    obj = params;
  }

  const method = req.method;
  const path = req.baseUrl;
  const route = req.path;
  const fields = Object.keys(obj);

  if (method === "GET") {
    if ((fields.includes("order") && !fields.includes("sort")) || (fields.includes("sort") && !fields.includes("order"))) {
      return {
        valid: false,
        error: "Order and Sort are required each other",
      };
    }

    if ((fields.includes("minPrice") && !fields.includes("maxPrice")) || (fields.includes("maxPrice") && !fields.includes("minPrice"))) {
      return {
        valid: false,
        error: "minPrice and maxPrice are required each other",
      };
    }
  }

  if (method === "POST") {
    let valid = true;
    let error = null;
    if (path !== "/auth" && path !== "/transaction" && route !== "/new-order/") {
      rules.forEach((val) => {
        if (!fields.includes(val) || req.file === undefined) {
          valid = false;
          error = "Missing Required Field(s)";
        }
      });
    }
    rules.forEach((val) => {
      if (!fields.includes(val)) {
        valid = false;
        error = "Missing Required Field(s)";
      }
    });

    return { error, valid };
  }

  if (method === "PATCH" && path !== "/transaction") {
    if (!fields.length && !fields.includes("id")) {
      if (req.file) {
        return { valid: true, error: null };
      }
      return { valid: false, error: "Required at least 1 field to edit" };
    }
    if (fields.includes("id")) {
      if (fields.length < 2) {
        if (req.file) {
          return { valid: true, error: null };
        }
        return { valid: false, error: "Required at least 1 field to edit" };
      }
    }
  }

  return { valid: true, error: null };
};

module.exports = validatorHelper;
