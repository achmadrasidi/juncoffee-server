const Router = require("express").Router();
const { messaging } = require("../config/firebase");
const notif = messaging();
const productsRouter = require("./productRoutes");
const usersRouter = require("./userRoutes");
const promosRouter = require("./promoRoutes");
const transactionsRouter = require("./transactionRoutes");
const authRouter = require("./authRoutes");

Router.get("/", (_req, res) => {
  res.json({
    message: "This is juncoffee API",
  });
});
Router.use("/auth", authRouter);
Router.use("/user", usersRouter);
Router.use("/product", productsRouter);
Router.use("/promo", promosRouter);
Router.use("/transaction", transactionsRouter);
Router.post("/send-notification", async (req, res) => {
  try {
    const { token, title, message } = req.body;
    const msg = {
      token,
      notification: {
        body: message,
        title,
      },
    };
    await notif.send(msg);
    res.status(200).json({
      message: "Notification Send",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
Router.get("*", (_req, res) => {
  res.status(404).json({
    message: "Page Not Found",
  });
});

module.exports = Router;
