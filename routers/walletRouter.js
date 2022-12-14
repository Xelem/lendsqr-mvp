const express = require("express");
const authController = require("../controllers/authController");
const walletController = require("../controllers/walletController");
const paystackController = require("../controllers/paystackController");

const router = express.Router();

// router.get("/resolve_account", paystackController.verifyAccountDetails);
// router.post("/create_recipient", paystackController.createRecipient);
// router.post("/initiate_transfer", paystackController.initiateTransfer);

router.use(authController.protect);

router.post(
  "/fund_wallet",
  walletController.fundWallet,
  paystackController.initializeTransaction
);
router.get("/fund_wallet/verify/:ref", paystackController.verifyPayment);
router.get("/listbanks", paystackController.listBanks);

router.post(
  "/withdraw",
  walletController.withdrawFunds,
  paystackController.verifyAccountDetails
);
router.post("/transfer", walletController.transferFunds);

module.exports = router;
