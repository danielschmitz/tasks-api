const bcrypt = require("bcrypt");
const password = "123456";
const hash = bcrypt.hashSync(password, 10);

exports.seed = function (knex, _Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("users").insert([
        { name: "user1", email: "user1@email.com", password: hash, role: "admin" },
        { name: "user2", email: "user2@email.com", password: hash, role: "user" },
        { name: "user3", email: "user3@email.com", password: hash, role: "user"},
      ]);
    });
};
