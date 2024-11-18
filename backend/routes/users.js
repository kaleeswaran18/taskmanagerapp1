
;
const express = require('express');
const { verifyToken, checkRole } = require("../middlewares/auth");
const { register, login, logout,alluser } = require('../controller/index');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    logdetails,
    getalltask
  } = require("../controller/task");

const router = express.Router();

router.post('/register', register);
router.get('/alluser', alluser);
router.post('/login', login);
router.post('/logout', logout);


  
//   // Create a new task
//   router.post("/", createTask);
  
//   // Get all tasks
//   router.get("/", getTasks);
  
//   // Get a single task by ID
//   router.get("/task/:id", getTaskById);
  
//   // Update a task
//   router.put("/", updateTask);
  
//   // Delete a task
//   router.delete("/:id", deleteTask);

  router.post("/", verifyToken, checkRole(["Admin", "User"]), createTask);

// Get all tasks (Only Admin can access)
router.get("/", verifyToken, checkRole(["Admin"]), getTasks);
router.get("/getalltask",getalltask);
// Get a single task by ID (Admins can access any task; Users only their own)
router.get("/task/:id", verifyToken, checkRole(["Admin", "User"]), getTaskById);

// Update a task (Admins can update any task; Users only their own)
router.put("/", verifyToken, checkRole(["Admin", "User"]), updateTask);
router.get("/logs", verifyToken, checkRole(["Admin", "User"]),logdetails);
// Delete a task (Only Admin can delete)
router.delete("/:id", verifyToken, checkRole(["Admin"]), deleteTask);
//router.post('/activelog',verifyToken, checkRole(["Admin"]), activelog)
module.exports = router;


