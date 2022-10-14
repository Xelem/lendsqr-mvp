const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY_DEV);
const knexConfig = require("../db/knexfile");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.initializeTransaction = async (req, res) => {
  const session = await paystack.transaction.initialize({
    email: req.user.email,
    amount: req.amount * 100,
  });

  res.status(200).json({
    status: "success",
    session,
  });
};

exports.verifyPayment = async (req, res) => {
  const status = await paystack.transaction.verify({
    reference: req.params.ref,
  });

  if (status.data.status !== "success") {
    return res.status(400).json({
      status: "fail",
      message: "Transaction was not successful, please try again",
    });
  }

  //   Update wallet balance
  const wallet = await knex("wallets")
    .select({
      id: "id",
      user_id: "user_id",
      wallet_address: "wallet_address",
      amount: "amount",
    })
    .where({ user_id: req.user.id });

  await knex("wallets")
    .where({ user_id: req.user.id })
    .update({
      amount: wallet[0].amount + status.data.amount / 100,
    });

  const updWallet = await knex("wallets")
    .select({
      id: "id",
      user_id: "user_id",
      wallet_address: "wallet_address",
      amount: "amount",
    })
    .where({ user_id: req.user.id });

  res.status(200).json({
    status: "success",
    message: `Congratulations! You have successfully credited your Lendsqr wallet with ₦${
      status.data.amount / 100
    }`,
    balance: `₦${updWallet[0].amount}`,
  });
};
