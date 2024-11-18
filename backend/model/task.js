const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
  },
  description: {
    type: String,
    default: "",
  },
  dueDate: {
    type: String,
    required: [true, "Due date is required"],
  },
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming a User model exists
    required: [true, "Assigned user is required"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
