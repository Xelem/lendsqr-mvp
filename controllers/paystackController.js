const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY_DEV);
const knexConfig = require("../db/knexfile");
const AppError = require("../utilities/appError");
const catchAsync = require("../utilities/catchAsync");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.initializeTransaction = catchAsync(async (req, res) => {
  const session = await paystack.transaction.initialize({
    email: req.user.email,
    amount: req.amount * 100,
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.verifyPayment = catchAsync(async (req, res) => {
  const status = await paystack.transaction.verify({
    reference: req.params.ref,
  });

  if (status.data.status !== "success") {
    return next(
      new AppError("Transaction was not successful, please try again", 400)
    );
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
});

exports.listBanks = catchAsync(async (req, res) => {
  const banks = await paystack.misc.list_banks();

  res.status(200).json({ banks });
});

exports.verifyAccountDetails = catchAsync(async (req, res) => {
  const { accountNumber, bankCode, amount } = req.withdrawDetails;
  const result = await paystack.verification.resolveAccount({
    account_number: accountNumber,
    bank_code: bankCode,
  });
  console.log(result);
  res.status(200).json({
    status: "success",
    message: `Congratulations! You have withdrawn ₦${amount} from your Lendsqr account to ${result.data.account_name}`,
  });
});
