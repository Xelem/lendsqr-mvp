const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const knexConfig = require("../db/knexfile");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

//Create token
const createToken = (user) => {
  const { id } = user;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.create_account = async (req, res, next) => {
  const { firstName, lastName, userName, email, password } = req.body;

  if (!firstName || !lastName || !userName || !email || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please input all necessary fields",
    });
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({
      status: "fail",
      message: "Please put in a valid email address",
    });
  }
  if (!validator.isStrongPassword(password)) {
    res.status(400).json({
      status: "fail",
      message:
        "A strong password should be at least 8 characters long and MUST contain a lower case and an upper case letter, a number and a symbol",
    });
  }
  const hashedPW = await bcrypt.hash(password, 12);

  try {
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
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error,
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please input all necessary fields",
    });
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
    res.status(400).json({
      status: "fail",
      message: "Incorrect username or password",
    });
  }

  const token = createToken(user[0]);
  res.status(200).json({
    status: "success",
    message: "Logged in",
    token,
  });
};
