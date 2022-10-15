const validator = require("validator");
const knexConfig = require("../db/knexfile");
const catchAsync = require("../utilities/catchAsync");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.createWallet = catchAsync(async (req, res) => {
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
      username: "username",
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
});

exports.fundWallet = (req, res, next) => {
  const { amount } = req.body;

  if (!validator.isInt(amount, { min: 10000, max: 500000 })) {
    return next(
      new AppError(
        "You can deposit a minimum of ₦10,000 and a maximum of ₦500,000",
        400
      )
    );
  }
  req.amount = amount;
  next();
};

exports.transferFunds = catchAsync(async (req, res) => {
  const { username, amount } = req.body;

  // Check if balance is sufficient
  const senderWallet = await knex("wallets")
    .select({
      id: "id",
      user_id: "user_id",
      wallet_address: "wallet_address",
      amount: "amount",
    })
    .where({ user_id: req.user.id });

  if (amount > senderWallet[0].amount) {
    return next(new AppError("Insufficient balance", 400));
  }

  // Get the recipent details
  const recipient = await knex("users")
    .select({
      id: "id",
      username: "username",
    })
    .where({ username });

  if (!recipient[0]) {
    return next(new AppError("The recipient does not exist", 400));
  }

  const recipientWallet = await knex("wallets")
    .select({
      id: "id",
      user_id: "user_id",
      wallet_address: "wallet_address",
      amount: "amount",
    })
    .where({ user_id: recipient[0].id });

  // Actual transfer
  await knex("wallets")
    .where({ user_id: req.user.id })
    .update({
      amount: senderWallet[0].amount - amount,
    });

  await knex("wallets")
    .where({ user_id: recipient[0].id })
    .update({
      amount: recipientWallet[0].amount + amount,
    });

  // Get user wallet balance
  const updSenderWallet = await knex("wallets")
    .select({
      id: "id",
      user_id: "user_id",
      wallet_address: "wallet_address",
      amount: "amount",
    })
    .where({ user_id: req.user.id });

  res.status(200).json({
    status: "success",
    message: `You have successfully transferred ₦${amount} to ${username}`,
    balance: `₦${updSenderWallet[0].amount}`,
  });
});

exports.withdrawFunds = (req, res, next) => {};
