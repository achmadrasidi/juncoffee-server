const { getOrderById, createTransaction, findTransaction, updateTransaction, deleteTransaction, transactionSummary } = require("../models/transactionModel.js");

const getDetailOrder = async (req, res) => {
  try {
    const { data } = await getOrderById(req.params.id);
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

const findOrder = async (req, res) => {
  try {
    const { total, data } = await findTransaction();
    const group = groupByTransaction(data, "transaction_id");
    const detail = Object.entries(group).map((item) => {
      return { id: item[0], detail: item[1] };
    });
    res.status(200).json({
      total,
      data: detail,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const orderSummary = async (_req, res) => {
  try {
    const { data } = await transactionSummary();
    res.status(200).json({
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { data, message } = await createTransaction(req.body);

    res.status(201).json({
      data,
      message,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const editTransaction = async (req, res) => {
  try {
    const { data, message } = await updateTransaction(req.params.id);

    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

const deleteOrderById = async (req, res) => {
  try {
    const { data, message } = await deleteTransaction(req.params.id);

    res.status(200).json({
      data,
      message,
    });
  } catch (err) {
    const { message, status } = err;
    res.status(status).json({
      error: message,
    });
  }
};

module.exports = { getDetailOrder, addTransaction, findOrder, editTransaction, deleteOrderById, orderSummary };
