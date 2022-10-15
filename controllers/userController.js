const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const knexConfig = require("../db/knexfile");
const catchAsync = require("../utilities/catchAsync");
const AppError = require("../utilities/appError");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

//Create token
const createToken = (user) => {
  const { id } = user;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.create_account = catchAsync(async (req, res, next) => {
  const { firstName, lastName, userName, email, password } = req.body;

  if (!firstName || !lastName || !userName || !email || !password) {
    return next(new AppError("Please input all necessary fields", 400));
  }
  if (!validator.isEmail(email)) {
    return next(new AppError("Please put in a valid email address", 400));
  }
  if (!validator.isStrongPassword(password)) {
    return next(
      new AppError(
        "A strong password should be at least 8 characters long and MUST contain a lower case and an upper case letter, a number and a symbol",
        400
      )
    );
  }
  const hashedPW = await bcrypt.hash(password, 12);

  const userID = await knex("users").insert({
    first_name: firstName,
    last_name: lastName,
    username: userName,
    email,
    password: hashedPW,
  });

  const user = await knex("users")
    .select({
      id: "id",
      username: "username",
    })
    .where({ id: userID });

  const token = createToken(user[0]);
  req.user = user[0];
  req.token = token;
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Please input all necessary fields", 400));
  }

  const user = await knex("users")
    .select({
      id: "id",
      username: "username",
      first_name: "first_name",
      password: "password",
    })
    .where({ username });

  if (!user[0] || !(await bcrypt.compare(password, user[0].password))) {
    return next(new AppError("Incorrect username or password", 400));
  }

  const token = createToken(user[0]);
  res.status(200).json({
    status: "success",
    message: "Logged in",
    token,
  });
});
