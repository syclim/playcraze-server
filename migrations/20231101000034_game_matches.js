/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("game_matches", (table) => {
    table.increments("id").primary();
    table.string("user_id").notNullable();
    table.string("game_id").notNullable();
    table.string("game_name");
    table.string("game_genre");
    table.string("game_released");
    table.string("game_slug");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("game_matches");
};
