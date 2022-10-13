const bcrypt = require("bcrypt");
const validator = require("validator");
const knexConfig = require("../db/knexfile");
const knex = require("knex")(knexConfig[process.env.NODE_ENV]);

exports.create_account = async (req, res) => {
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

    res.status(201).json({
      status: "success",
      user: user[0],
    });
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

  res.status(200).json({
    status: "success",
    message: "Logged in",
  });
};
