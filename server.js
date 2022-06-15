require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const path = require("path");
const cors = require("cors");

const mainRouter = require("./src/routes/index.js");
const { dbConn } = require("./src/config/db.js");

const { errorHandling } = require("./src/middleware/errorHandler.js");
const { redisConn } = require("./src/config/redis");

dbConn();
redisConn();
const app = express();
const PORT = process.env.PORT;

const originList = ["http://localhost:3000", "https://juncoffee.netlify.app", "::1"];

const corsOption = {
  origin: (origin, callback) => {
    if (originList.includes(origin) || !origin) return callback(null, true);
    return callback(new Error("Forbidden Origin"));
  },
  optionsSuccessStatus: 200,
  methods: ["OPTIONS", "GET", "POST", "PATCH", "DELETE"],
};

app.use(cors(corsOption));
app.use(logger(":method :url :status :res[content-length] - :response-time ms"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(mainRouter);

app.use(errorHandling);

app.listen(PORT, console.log(`Server is Running at port ${PORT}`));
