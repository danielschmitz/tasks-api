/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("tasks").del();
  await knex("tasks").insert([
    {
      user_id: 1,
      category_id: 1,
      name: "task 1",
      description: "My task 1",
      done: false,
    },
    {
      user_id: 1,
      category_id: 1,
      name: "task 2",
      description: "My task 2",
      done: false,
    },
    {
      user_id: 1,
      category_id: 2,
      name: "task 3",
      description: "My task 3",
      done: true,
    },
    {
      user_id: 2,
      category_id: 4,
      name: "task 4",
      description: "My task 4",
      done: false,
    },
  ]);
};
