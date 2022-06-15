const { getPromos, createPromo, getPromoById, updatePromo, deletePromo } = require("../models/promoModel.js");
const { promoStorage } = require("../config/cache");
const fs = require("fs");

const getDetailPromo = async (req, res) => {
  try {
    const { data } = await getPromoById(req.params.id);
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

const searchPromos = async (req, res) => {
  try {
    const { totalPromo, totalPage, data } = await getPromos(req.query);
    const { page = 1, limit = 3 } = req.query;
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
    const nextPage = `/promo${pageQuery}${Number(page) + 1}${limitQuery}${route}`;
    const prevPage = `/promo${pageQuery}${Number(page) - 1}${limitQuery}${route}`;

    const meta = {
      totalPromo,
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

const addPromo = async (req, res) => {
  try {
    const { file } = req;
    let image = "";

    if (file) {
      image = file.path;
    }
    const { data, message } = await createPromo(req.body, image);

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

const editPromo = async (req, res) => {
  try {
    const { file } = req;
    let image = "";

    if (file) {
      image = file.path;
    }

    const { data, message } = await updatePromo(req.body, req.params.id, image);

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

const deletePromoById = async (req, res) => {
  try {
    const { data, message } = await deletePromo(req.params.id);

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

module.exports = { getDetailPromo, addPromo, searchPromos, editPromo, deletePromoById };
