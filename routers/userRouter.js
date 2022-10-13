const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/create_account", userController.create_account);

module.exports = router;
