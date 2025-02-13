var express = require("express");
const Joi = require("joi");
const db = require("../db");
const utils = require("../utils");
var router = express.Router();

const taskSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(1000),
  done: Joi.boolean(),
  user_id: Joi.number(),
  Task_id: Joi.number(),
});

// Router endpoints

router.get("/tasks", utils.checkLogin, (req, res, _next) => {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Get undone tasks by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'A list of tasks' }
  */
  return getTasks(req, res, false);
});

router.get("/tasks/done", utils.checkLogin, (req, res, _next) => {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Get done tasks by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'A list of tasks' }
  */
  return getTasks(req, res, true);
});

router.get("/tasks/all", utils.checkLogin, async function (req, res, _next) {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Get all tasks by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'A list of tasks' }
  */
  const user_id = req.auth.id;
  const tasks = await db("tasks").where({ user_id });
  return res.json(tasks);
});

router.get("/tasks/:id", utils.checkLogin, async function (req, res, _next) {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Get a task by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'A task' }
  */
  const user_id = req.auth.id;
  const task = await db("tasks").where({ id: req.params.id, user_id });
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  return res.json(task[0]);
});

router.post("/tasks", utils.checkLogin, async function (req, res, _next) {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Create a task by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[409] = { description: 'Task already exists' }
    #swagger.responses[403] = { description: 'Invalid Input' }
    #swagger.responses[201] = { description: 'Task created' }
    #swagger.parameters['task'] = {
        in: 'body',
        description: 'Task Data',
        required: true,
        schema: { 
            'name': 'Task name',
            'description': 'Task description',
            'category_id': 'Category id',
            'done': 'Task is done'
        }
    }
  */
  const user_id = req.auth.id;
  const { name, description, category_id, done } = req.body;

  const validateSchema = taskSchema.validate({ name });
  if (validateSchema.error) {
    return res.status(403).json({ message: validateSchema.error.message });
  }

  // search task by name
  const existing_task = await db("tasks").where({ name, user_id });
  if (existing_task.length > 0) {
    return res.status(409).json({ message: "Task already exists" });
  }

  // create new task
  const task = await db("tasks")
    .insert({
      name,
      user_id,
      description,
      category_id,
      done,
    })
    .returning(["id", "name", "description", "user_id", "category_id", "done"]);

  return res.json(task[0]);
});

router.put("/tasks/complete", utils.checkLogin, (req, res, _next) => {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Complete a list of tasks by logged user (set done = true)'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Task not found' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'Tasks updated' }
  */
  return updateTaskStatus(req, res, true);
});

router.put("/tasks/incomplete", utils.checkLogin, (req, res, _next) => {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Mark as incomplete a list of tasks by logged user (set done = false)'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Task not found' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'Tasks updated' }
  */
  return updateTaskStatus(req, res, false);
});

router.put("/tasks/:id", utils.checkLogin, async function (req, res, _next) {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Update a task by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Task not found' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'Task updated' }
    #swagger.parameters['task'] = {
        in: 'body',
        description: 'Task Data',
        required: true,
        schema: { 
            'name': 'Task name',
            'description': 'Task description',
            'category_id': 'Category id',
            'done': 'Task is done'
        }
    }
  */
  const user_id = req.auth.id;
  const { name, description, category_id, done } = req.body;
  const id = req.params.id;

  const validateSchema = taskSchema.validate({ name });
  if (validateSchema.error) {
    return res.status(403).json({ message: validateSchema.error.message + "!!!" });
  }

  const task_exists = await db("tasks").where({ id, user_id });
  if (!task_exists) {
    return res.status(404).json({ message: "Task not found" });
  }

  // update task
  const task = await db("tasks")
    .where({ id, user_id })
    .update({ name, description, category_id, done })
    .returning(["id", "name", "description", "category_id", "user_id"]);

  return res.json(task[0]);
});

router.put("/tasks/complete/:id", utils.checkLogin, (req, res, _next) => {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Complete a task by logged user (set done = true)'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Task not found' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'Task updated' }
  */
  updateTaskCompletionStatus(req, res, true);
});

router.put("/tasks/incomplete/:id", utils.checkLogin, (req, res, _next) => {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Mark as incomplete a task by logged user (set done = false)'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Task not found' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[200] = { description: 'Task updated' }
  */
  updateTaskCompletionStatus(req, res, false);
});

router.delete("/tasks/:id", utils.checkLogin, async function (req, res, _next) {
  /*
    #swagger.tags = ['Tasks']
    #swagger.summary = '🔒️ Delete a task by logged user'
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Task not found' }
    #swagger.responses[500] = { description: 'Authorization header is required' }
    #swagger.responses[204] = { description: 'Task deleted' }
  */
  const user_id = req.auth.id;
  const id = req.params.id;
  const task = await db("tasks").where({ id, user_id });
  if (task.length === 0) {
    return res.status(404).json({ message: "Task not found" });
  }
  await db("tasks").where({ id, user_id }).delete();
  return res.json({ message: "Task deleted" });
});

// Helper methods moved to the end with JSDoc comments

/**
 * Retrieves tasks based on done status for the authenticated user.
 * @param {object} req - Express request object (must include req.auth.id).
 * @param {object} res - Express response object.
 * @param {boolean} done - The done status of tasks to retrieve.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
const getTasks = async (req, res, done) => {
  const user_id = req.auth.id;
  try {
    const tasks = await db("tasks")
      .select([
        "tasks.id",
        "tasks.name", 
        "tasks.description",
        "tasks.done",
        "categories.name as category",
        "categories.id as categoryId"
      ])
      .where({ 
        "tasks.user_id": user_id, 
        "tasks.done": done 
      })
      .join("categories", "categories.id", "tasks.category_id");
    
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ 
      message: "Error fetching tasks",
      error: error.message 
    });
  }
};

/**
 * Updates the status of multiple tasks for the authenticated user.
 * @param {object} req - Express request object (must include req.auth.id and req.body.ids).
 * @param {object} res - Express response object.
 * @param {boolean} isDone - The new done status to set for the tasks.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
const updateTaskStatus = async (req, res, isDone) => {
  const user_id = req.auth.id;
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Ids is required" });
  }

  const tasks = await db("tasks").whereIn("id", ids).andWhere({ user_id });
  if (tasks.length !== ids.length) {
    return res.status(404).json({ message: "Some tasks not found" });
  }

  // update tasks
  await db("tasks").whereIn("id", ids).andWhere({ user_id }).update({ done: isDone });

  return res.json({ message: "Tasks updated" });
};

/**
 * Updates the completion status of a single task for the authenticated user.
 * @param {object} req - Express request object (must include req.auth.id and req.params.id).
 * @param {object} res - Express response object.
 * @param {boolean} isDone - The new done status to set for the task.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
const updateTaskCompletionStatus = async (req, res, isDone) => {
  const user_id = req.auth.id;
  const id = req.params.id;

  const task_exists = await db("tasks").where({ id, user_id });
  if (!task_exists) {
    return res.status(404).json({ message: "Task not found" });
  }

  // update task
  const task = await db("tasks")
    .where({ id, user_id })
    .update({ done: isDone })
    .returning([
      "id",
      "name",
      "description",
      "category_id",
      "user_id",
      "done",
    ]);

  return res.json(task[0]);
};

module.exports = router;