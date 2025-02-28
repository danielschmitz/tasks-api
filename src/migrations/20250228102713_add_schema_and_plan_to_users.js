/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('users', function(table) {
    table.string('schema', 50).defaultTo('default');
    table.integer('plan').defaultTo(1); // 1 = free, 2 = pro, 3 = ultimate
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('schema');
    table.dropColumn('plan');
  });
};
