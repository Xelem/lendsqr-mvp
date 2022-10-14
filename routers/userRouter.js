const express = require("express");
const userController = require("../controllers/userController");
const walletController = require("../controllers/walletController");

const router = express.Router();

router.post(
  "/create_account",
  userController.create_account,
  walletController.createWallet
);
router.post("/login", userController.login);

module.exports = router;
