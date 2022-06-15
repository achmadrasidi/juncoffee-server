const multer = require("multer");
const path = require("path");
const { getProductById } = require("../models/productModel");
const { getPromoById } = require("../models/promoModel");
const { storage } = require("../config/cloudinary");

// const imageStore = multer.diskStorage({
//   destination: (req, _file, cb) => {
//     let route = req.baseUrl;
//     if (route === "/auth") route = "/user";
//     const imageDir = `./public/images${route}`;
//     cb(null, imageDir);
//   },
//   filename: (_req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const fileName = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);

//     cb(null, fileName);
//   },
// });

const limitSize = {
  fileSize: 2e6,
};

// const imageFilter = async (req, file, cb) => {
//   try {
//     const extName = path.extname(file.originalname);
//     const allowedExt = /jpg|png|jpeg|JPG|PNG|JPEG/;
//     const route = req.baseUrl;
//     const { params } = req;
//     const paramsLen = Object.keys(params).length;
//     if (paramsLen && route === "/product") await getProductById(req.params.id);
//     if (paramsLen && route === "/promo") await getPromoById(req.params.id);

//     if (!extName.match(allowedExt)) return cb(new Error("Invalid image extension (jpg,jpeg,png)"), false);
//     cb(null, true);
//   } catch (err) {
//     const { message } = err;
//     return cb(new Error(message), false);
//   }
// };

const imageUpload = multer({
  storage: storage,
  limits: limitSize,
}).single("photo");

const uploadFile = (req, res, next) => {
  imageUpload(req, res, (err) => {
    if (err) {
      let status = 400;
      if (err.message.includes("Not Found")) status = 404;
      next({ status, message: err.message });
      return;
    }
    next();
  });
};

module.exports = uploadFile;
