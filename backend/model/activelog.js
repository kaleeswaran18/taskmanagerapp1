// models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true, // e.g., "Task Created", "Task Updated", "Task Deleted"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assume you have a User model
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task', // Assume you have a Task model
      required: true,
    },
    details: {
      type: String,
      required: false, // Additional info (e.g., changes made)
    },
    updateTime: {
      type: String,
      required: false, // Additional info (e.g., changes made)
    },
    date: {
      type: String,
      required: false, // Additional info (e.g., changes made)
    },
    title: {
      type: String,
      required: false, // Additional info (e.g., changes made)
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const ActiveLog = mongoose.model('ActiveLog', logSchema);

module.exports = ActiveLog;
