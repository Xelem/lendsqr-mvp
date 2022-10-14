const express = require("express");
const walletController = require("../controllers/walletController");

const router = express.Router();

router.get("/fund_wallet", walletController.fundWallet);

module.exports = router;
