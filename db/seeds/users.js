/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    {
      id: 1,
      first_name: "Jon",
      last_name: "Doe",
      username: "JonDee",
      email: "jondoe@email.com",
      password: "1234567890",
    },
    {
      id: 2,
      first_name: "Mike",
      last_name: "Mill",
      username: "MikeMee",
      email: "mikemee@email.com",
      password: "1234567890",
    },
    {
      id: 3,
      first_name: "Bron",
      last_name: "Jude",
      username: "BronJuu",
      email: "bronjude@email.com",
      password: "1234567890",
    },
  ]);
};
