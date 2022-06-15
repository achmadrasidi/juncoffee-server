const Router = require("express").Router();

const { addTransaction, findOrderByQueries, editTransaction, deleteOrderById, getDetailOrder, orderSummary } = require("../controllers/transactionController.js");

const { orderValidator } = require("../middleware/fieldValidator.js");
const { valueValidator } = require("../middleware/valueValidator.js");
const { checkToken, checkRole } = require("../middleware/authValidator");

// ADMIN
// get transaction details
Router.get("/detail/:id", checkToken, checkRole("admin"), valueValidator, getDetailOrder);
// get all transactions or search transactions
Router.get("/", checkToken, checkRole("admin"), valueValidator, orderValidator, findOrderByQueries);
// get transaction summary
Router.get("/summary", checkToken, checkRole("admin"), orderSummary);
// add new transaction
Router.post("/", checkToken, checkRole("admin"), valueValidator, orderValidator, addTransaction);
// update order status
Router.patch("/:id", checkToken, checkRole("admin"), valueValidator, orderValidator, editTransaction);
// delete transaction
Router.delete("/:id", checkToken, checkRole("admin"), valueValidator, deleteOrderById);

module.exports = Router;
