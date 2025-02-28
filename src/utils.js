/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("./db");

const utils = {
  checkLogin: async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(400)
        .send({ message: "Authorization header is required" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async function (err, auth) {
      if (err) {
        return res.status(401).send({ message: "Unauthorized" });
      } else {
        // Verificar se o usuário está banido
        const user = await db("users").where({ id: auth.id }).first();
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        
        if (user.ban) {
          return res.status(403).send({ message: "Your account has been banned" });
        }
        
        req.auth = auth;
        // TODO: check schema, plan, user
        // if shema or plan for diferente, bloqueie o usuário
        next();
      }
    });
  },

  checkAdmin: async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(400)
        .send({ message: "Authorization header is required" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async function (err, auth) {
      if (err) {
        return res.status(401).send({ message: "Unauthorized" });
      } else {
        const user = await db("users").where({ id: auth.id }).first();
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        
        if (user.ban) {
          return res.status(403).send({ message: "Your account has been banned" });
        }
        
        if (user.role !== "admin") {
          return res.status(403).send({ message: "Forbidden: Admins only" });
        }
        
        req.auth = auth;
        next();
      }
    });
  },
};

module.exports = utils;
