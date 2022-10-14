const express = require("express");
const authController = require("../controllers/authController");
const walletController = require("../controllers/walletController");
const paystackController = require("../controllers/paystackController");

const router = express.Router();

router.post("/create_recipient", paystackController.createRecipient);
router.post("/initiate_transfer", paystackController.initiateTransfer);
router.get("/listbanks", paystackController.listBanks);
router.get("/resolve_account", paystackController.verifyAccountDetails);

router.use(authController.protect);

router.post(
  "/fund_wallet",
  walletController.fundWallet,
  paystackController.initializeTransaction
);
router.get("/fund_wallet/verify/:ref", paystackController.verifyPayment);

router.post("/withdraw", walletController.withdrawFunds);
router.post("/transfer", walletController.transferFunds);

module.exports = router;
