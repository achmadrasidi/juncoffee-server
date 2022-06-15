const Router = require("express").Router();

const { getDetailPromo, searchPromos, addPromo, editPromo, deletePromoById } = require("../controllers/promoController.js");

const { promoValidator } = require("../middleware/fieldValidator.js");
const { valueValidator } = require("../middleware/valueValidator.js");
const { checkToken, checkRole } = require("../middleware/authValidator");
const uploadFile = require("../middleware/fileUpload");

// USER
// get promo details
Router.get("/detail/:id", checkToken, checkRole("user"), valueValidator, getDetailPromo);
// view all promo,search promo
// Router.get("/", checkToken, checkRole("user"), valueValidator, promoValidator, searchPromos);
Router.get("/", valueValidator, promoValidator, searchPromos);

// ADMIN
// add new promo
Router.post("/", checkToken, checkRole("admin"), valueValidator, uploadFile, promoValidator, addPromo);
// edit promo
Router.patch("/:id", checkToken, checkRole("admin"), valueValidator, uploadFile, promoValidator, editPromo);
// delete promo
Router.delete("/:id", checkToken, checkRole("admin"), valueValidator, deletePromoById);

module.exports = Router;
