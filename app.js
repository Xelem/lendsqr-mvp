const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
const userRouter = require("./routers/userRouter");
const walletRouter = require("./routers/walletRouter");
const globalErrorHandler = require("./controllers/errorController");

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit request from the same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/wallets", walletRouter);

app.use(globalErrorHandler);

module.exports = app;
