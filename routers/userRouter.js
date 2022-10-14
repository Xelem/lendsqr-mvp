const express = require("express");
const userController = require("../controllers/userController");
const walletController = require("../controllers/walletController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/create_account",
  userController.create_account,
  walletController.createWallet
);
router.post("/login", userController.login);

router.use(authController.protect);

router.get("/test", (req, res) => {
  res.status(200).json({
    message: "success",
  });
});

module.exports = router;
