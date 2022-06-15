const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudConfig = (_req, _res, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
  next();
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "assets",
  },
});

module.exports = { storage, cloudConfig };
