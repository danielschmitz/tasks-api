/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("categories").del();
  await knex("categories").insert([
    {  user_id: 1, name: "Category 1.1" },
    {  user_id: 1, name: "Category 1.2" },
    {  user_id: 1, name: "Category 1.3" },
    {  user_id: 2, name: "Category 2.1" },
    {  user_id: 2, name: "Category 2.2" },
    {  user_id: 2, name: "Category 2.3" },
  ]);
};
