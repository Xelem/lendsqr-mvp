const express = require("express");
const authController = require("../controllers/authController");
const walletController = require("../controllers/walletController");
const paystackController = require("../controllers/paystackController");

const router = express.Router();

router.use(authController.protect);

router.post(
  "/fund_wallet",
  walletController.fundWallet,
  paystackController.initializeTransaction
);

module.exports = router;
