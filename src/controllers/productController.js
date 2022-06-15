const { getProducts, getProductByFav, createProduct, updateProduct, deleteProduct, getProductById } = require("../models/productModel.js");
const { productStorage } = require("../config/cache");
const fs = require("fs");

const getProductDetail = async (req, res) => {
  try {
    const { data } = await getProductById(req.params.id);
    res.status(200).json({
      data,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { totalProduct, totalPage, data } = await getProducts(req.query);
    const { page = 1, limit = 12 } = req.query;
    const queryProp = Object.keys(req.query);
    let pageQuery = "?page=";
    let limitQuery = `&limit=${limit}`;
    let route = "";

    const re = new RegExp(`\&page=${page}`);
    const reg = new RegExp(`\&limit=${limit}`);

    if (queryProp.length) {
      route = req._parsedUrl.search.replace(/\?/g, "&").replace(re, "").replace(reg, "");
    }

    const currentPage = Number(page);
    const nextPage = `/product${pageQuery}${Number(page) + 1}${limitQuery}${route}`;
    const prevPage = `/product${pageQuery}${Number(page) - 1}${limitQuery}${route}`;

    const meta = {
      totalProduct,
      totalPage,
      currentPage,
      nextPage: currentPage === Number(totalPage) ? null : nextPage,
      prevPage: currentPage === 1 ? null : prevPage,
    };

    data.forEach((val) => delete val.total);

    res.status(200).json({
      meta,
      data,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const favProduct = async (req, res) => {
  try {
    const { totalProduct, totalPage, data } = await getProductByFav(req.query);
    const { page = 1, limit = 5 } = req.query;
    const queryProp = Object.keys(req.query);
    let pageQuery = "?page=";
    let limitQuery = `&limit=${limit}`;
    let route = "";

    const re = new RegExp(`\&page=${page}`);
    const reg = new RegExp(`\&limit=${limit}`);

    if (queryProp.length) {
      route = req._parsedUrl.search.replace(/\?/g, "&").replace(re, "").replace(reg, "");
    }

    const currentPage = Number(page);
    const nextPage = `/product${pageQuery}${Number(page) + 1}${limitQuery}${route}`;
    const prevPage = `/product${pageQuery}${Number(page) - 1}${limitQuery}${route}`;

    const meta = {
      totalProduct,
      totalPage,
      currentPage,
      nextPage: currentPage === Number(totalPage) ? null : nextPage,
      prevPage: currentPage === 1 ? null : prevPage,
    };

    data.forEach((val) => delete val.total);

    res.status(200).json({
      meta,
      data,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const { file } = req;
    let image = "";

    if (file) {
      image = file.path.replace("public", "").replace(/\\/g, "/");
      const imageDirCache = image.split("/")[3].split(".")[0];
      const imageCache = image.split("/")[3];
      productStorage.setItem(imageDirCache, imageCache);
    }

    const { data, message } = await createProduct(req.body, image);
    res.status(201).json({
      data,
      message,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { file } = req;
    let image = "";
    if (file) {
      image = file.path.replace("public", "").replace(/\\/g, "/");
      const {
        data: { image: oldImage },
      } = await getProductById(req.params.id);
      if (oldImage) {
        const route = req.baseUrl;
        const oldItem = oldImage.split("/")[3].split(".")[0];
        const oldCache = productStorage.getItem(oldItem);
        if (oldCache) {
          fs.unlinkSync(`./public/images${route}/${oldCache}`);
          productStorage.removeItem(oldItem);
        }
      }
      const imageDirCache = image.split("/")[3].split(".")[0];
      const imageCache = image.split("/")[3];
      productStorage.setItem(imageDirCache, imageCache);
    }

    const { data, message } = await updateProduct(req.body, req.params.id, image);

    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const { data, message } = await deleteProduct(req.params.id);
    const routes = req.baseUrl;
    const oldImage = data.image;
    if (oldImage) {
      const oldItem = oldImage.split("/")[3].split(".")[0];
      const oldCache = productStorage.getItem(oldItem);
      if (oldCache) fs.unlinkSync(`./public/images${routes}/${oldCache}`);
      productStorage.removeItem(oldItem);
    }
    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message } = err;
    const status = err.status ? err.status : 500;
    res.status(status).json({
      error: message,
    });
  }
};

module.exports = {
  searchProducts,
  getProductDetail,
  favProduct,
  addProduct,
  editProduct,
  deleteProductById,
};
