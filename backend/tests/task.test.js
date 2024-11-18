const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { server } = require("../app"); // Import your Express app and server
const User = require("../model/model"); // Adjust path if needed
const Task = require("../model/task"); // Adjust path if needed

let token;
require('dotenv').config();
jest.setTimeout(20000); // Extend timeout to accommodate database operations

beforeAll(async () => {
  try {
    console.log("Connecting to the database...");
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Database connected");

    console.log("Creating admin user...");
    const user = await User.create({ username: "admin", password: "admin123", role: "Admin" });
    console.log("Admin user created:", user);

    console.log("Generating token...");
    token = jwt.sign({ id: user._id, role: "Admin" }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log("Token generated");
  } catch (error) {
    console.error("Error in beforeAll setup:", error.message);
  }
});

afterAll(async () => {
  try {
    console.log("Cleaning up...");
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
    server.close();
    console.log("Cleanup complete");
  } catch (error) {
    console.error("Error in afterAll teardown:", error.message);
  }
});

describe("Task Management API", () => {
    
  it("should create a task", async () => {
    console.log(process.env.MONGO_URI,"process.env.DB_URI111",token)
    const res = await request(server)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "This is a test task",
        assignedUser: "673aed90109f84214270ce48",
        dueDate:"2024-11-18",
      });
    console.log(res.statusCode,"res.statusCodecheck",res.body,res.body.data.title)
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Task created successfully");
    expect(res.body.data).toHaveProperty("title", "Test Task");
  });


  it("should fetch all tasks", async () => {
    const res = await request(server).get("/users").set("Authorization", `Bearer ${token}`);

    console.log(res.body,res.statusCode,res.body.data,'checkfetch alll')
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should fetch a single task by ID", async () => {
    // Create a task first
    const newTask = await Task.create({
      title: "Fetch Task",
      description: "Task to fetch",
      assignedUser: "673aed90109f84214270ce48",
      dueDate:"2024-11-18",
    });

    const res = await request(server)
    .get(`/users/task/${newTask._id}`)
      .set("Authorization", `Bearer ${token}`);
      console.log(res.statusCode,"newTask._id",res.body,newTask._id)
    expect(res.statusCode).toBe(200);
    //expect(res.body.task).toHaveProperty("title", "Fetch Task");
  });

  it("should update a task", async () => {
    // Create a task first
    const task = await Task.create({
      title: "Update Task",
      description: "Task to update",
      assignedUser: "673aed90109f84214270ce48",
      dueDate: "2024-11-18", // Ensure all necessary fields are included
      
    });
    // console.log(task,'taskaaaaaaaa')
  
    // Update the task by sending the task ID in the URL
    const res = await request(server)
      .put('/users') // Use the correct URL with task ID
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task" });
  console.log(res.statusCode,res.body.message,res.body.task,'checkvirat')
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task updated successfully");
    expect(res.body.task).toHaveProperty("title", "Updated Task");
  });
  

  it("should delete a task", async () => {
    // Create a task first
    const task = await Task.create({
      title: "Delete Task",
      description: "Task to delete",
      assignedUser: "673aed90109f84214270ce48",
      dueDate:"2024-11-18",
    });

    const res = await request(server)
      .delete(`/users/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task deleted successfully");
  });
});
