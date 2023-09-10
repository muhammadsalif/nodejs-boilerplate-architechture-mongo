const cors = require("cors");
const xss = require("xss-clean");
const morgan = require("morgan");
const multer = require("multer");
const express = require("express");
const compression = require("compression");
// const mongoSanitize = require("express-mongo-sanitize");
const { NODE_ENV } = require("./config/environment/index");
const api = require("./api");
const app = express();

app.use(multer().any());
app.enable("trust proxy");
app.use(cors());
app.options("*", cors());
app.use(express.json({ limit: "10kb" }));
// app.use(mongoSanitize());
app.use(xss());
app.use(compression());

NODE_ENV === "development" ? app.use(morgan("dev")) : null;

app.use("/api", api);

module.exports = app;
