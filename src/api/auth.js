const express = require("express");
const router = express.Router();
require("dotenv").config();

const Joi = require("joi");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const db = require("../db");
const utils = require("../utils");

const userSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  password: Joi.string().min(3).max(30).required(),
  email: Joi.string().required().email(),
});

router.post("/auth/login", async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Try to login. If user.name is provided, it will be created'
    #swagger.parameters['user'] = {
        in: 'body',
        description: 'User Login Data',
        required: true,
        schema: { 
            "email": "user1@email.com",
            "password": "123456"
        }
    } 
    #swagger.responses[403] = { description: 'Invalid input' }
    #swagger.responses[500] = { description: 'No user found with that email' }
    #swagger.responses[500] = { description: 'Incorrect password' }
    #swagger.responses[200] = { description: "Token" }
    */

  const { email, password, name } = req.body;

  const validateData = userSchema.validate({ email, password, name });
  if (validateData.error) {
    return res.status(403).json({
      message: validateData.error.message,
    });
  }

  const user = await db("users").where({ email }).first();
  if (!user) {
    if (name) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        name,
        email,
        password: hashedPassword,
      };
      const newUser = await db("users").insert(user).returning(['id','name','email']);
      const token = getToken(newUser[0]);
      return res.status(200).json({ token });
    } else {
      return res.status(500).json({ message: "No user found with that email" });
    }
  }

  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = getToken(user);

  res.status(200).json({ token });
});

router.get("/checkLogin", utils.checkLogin, async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = '🔒️ Check login and return token info'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: "Token" }
    */
  return res.status(200).json({
    token: req.auth,
  });
});

module.exports = router;

function getToken(newUser) {
  return jsonwebtoken.sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1y",
    }
  );
}
