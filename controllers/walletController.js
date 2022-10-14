const validator = require("validator");
const knexConfig = require("../db/knexfile");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.createWallet = async (req, res) => {
  const { id, username } = req.user;
  const token = req.token;

  let characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  let length = 20;
  for (let i = length; i > 0; --i)
    result += characters[Math.round(Math.random() * (characters.length - 1))];

  const walletID = await knex("wallets").insert({
    user_id: id,
    amount: 0,
    wallet_address: result,
  });

  const wallet = await knex("wallets")
    .select({
      id: "id",
      user_id: "user_id",
      wallet_address: "wallet_address",
    })
    .where({ id: walletID });

  res.status(201).json({
    status: "success",
    user: {
      id,
      username,
    },
    wallet: wallet[0],
    token,
  });
};

exports.fundWallet = (req, res, next) => {
  const { amount } = req.body;

  if (!validator.isInt(amount, { min: 10000, max: 500000 })) {
    return res.status(400).json({
      status: "fail",
      message: "You can deposit a minimum of ₦10,000 and a maximum of ₦500,000",
    });
  }
  req.amount = amount;
  next();
};
