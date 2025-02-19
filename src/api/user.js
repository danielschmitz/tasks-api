const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const db = require("../db");
const utils = require("../utils");

const editSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
});

const changePassSchema = Joi.object({
  oldPassword: Joi.string().min(3).max(30).required(),
  newPassword: Joi.string().min(3).max(30).required(),
});

router.put("/edit", utils.checkLogin, async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = '🔒️ Edit user name and email'
    #swagger.parameters['user'] = {
        in: 'body',
        description: 'User Data',
        required: true,
        schema: { 
            "name": "newName",
            "email": "newEmail@example.com"
        }
    } 
    #swagger.responses[400] = { description: 'Invalid input or email already in use' }
    #swagger.responses[200] = { 
        description: "User updated successfully",
        schema: {
            message: "User updated successfully",
            data: {
                id: 1,
                name: "newName",
                email: "newEmail@example.com"
            }
        }
    }
    */

  const { name, email } = req.body;
  const { id } = req.auth;

  const validateData = editSchema.validate({ name, email });
  if (validateData.error) {
    return res.status(400).json({
      message: validateData.error.message,
    });
  }

  const existingUser = await db("users").where({ email }).first();
  if (existingUser && existingUser.id !== id) {
    return res.status(400).json({
      message: "Email already in use",
    });
  }

  await db("users").where({ id }).update({ name, email });
  const updatedUser = await db("users").where({ id }).first();

  res.status(200).json({
    message: "User updated successfully",
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    },
  });
});

router.put("/changePass", utils.checkLogin, async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = '🔒️ Change user password'
    #swagger.parameters['passwords'] = {
        in: 'body',
        description: 'Password Data',
        required: true,
        schema: { 
            "oldPassword": "oldPassword123",
            "newPassword": "newPassword123"
        }
    } 
    #swagger.responses[400] = { description: 'Invalid input or old password is incorrect' }
    #swagger.responses[200] = { 
        description: "Password changed successfully",
        schema: {
            message: "Password changed successfully",
            data: {
                id: 1,
                name: "userName",
                email: "userEmail@example.com"
            }
        }
    }
    */

  const { oldPassword, newPassword } = req.body;
  const { id } = req.auth;

  const validateData = changePassSchema.validate({ oldPassword, newPassword });
  if (validateData.error) {
    return res.status(400).json({
      message: validateData.error.message,
    });
  }

  const user = await db("users").where({ id }).first();
  const validatePassword = await bcrypt.compare(oldPassword, user.password);
  if (!validatePassword) {
    return res.status(400).json({
      message: "Old password is incorrect",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db("users").where({ id }).update({ password: hashedPassword });
  const updatedUser = await db("users").where({ id }).first();

  res.status(200).json({
    message: "Password changed successfully",
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    },
  });
});

module.exports = router;