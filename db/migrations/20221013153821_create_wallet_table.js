/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("wallets", function (table) {
    table.increments("id");
    table.string("user_id", 255).notNullable();
    table.integer("amount", 255).notNullable();
    table.string("wallet_address", 255).notNullable().unique();
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("wallets");
};
