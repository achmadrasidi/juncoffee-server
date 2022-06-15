const Router = require("express").Router();

const { getProductDetail, searchProducts, favProduct, addProduct, editProduct, deleteProductById } = require("../controllers/productController");
const { productValidator } = require("../middleware/fieldValidator.js");
const { valueValidator } = require("../middleware/valueValidator.js");
const { checkToken, checkRole } = require("../middleware/authValidator");
const uploadFile = require("../middleware/fileUpload");

// USER
// get product detail
Router.get("/detail/:id", valueValidator, getProductDetail);
// get all,search product
Router.get("/", valueValidator, productValidator, searchProducts);
// favourite product
Router.get("/favourite", valueValidator, productValidator, favProduct);

// ADMIN
// add new product
// Router.post("/", checkToken, checkRole("admin"), valueValidator, uploadFile, productValidator, addProduct);
Router.post("/", checkToken, valueValidator, uploadFile, productValidator, addProduct);
// edit product detail
Router.patch("/:id", checkToken, checkRole("admin"), valueValidator, uploadFile, productValidator, editProduct);
// delete product
Router.delete("/:id", checkToken, checkRole("admin"), valueValidator, deleteProductById);

module.exports = Router;
