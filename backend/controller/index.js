const User = require('../model/model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userSockets } = require('../socket');
require('dotenv').config();

console.log(process.env.NODE_ENV); // production
console.log(process.env.PORT);     // 3000

const register = async (req, res) => {
  try {
    console.log("register")
    const { username, password, role } = req.body;
    var value=await User.create({
        username:username,
        password:password,
        role:role,
        
       
      })
      res.status(200).send({
          value,
          message: "User registered successfully!"
      })
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
const login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      // Return the user details along with the token
      res.status(200).send({
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
          token, // Include the token in the response
        },
        message: "User login successfully!",
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };
  
  
  const logout = (req, res) => {
    res.json({ message: 'Logout successful' });
  };
  const alluser=async(req,res)=>{
  // const details=await User.find()
  const tasks = await User.find({
    role: { $ne: "Admin" }, // Use $ne to exclude tasks from a specific user
  });
  res.status(200).send({
    tasks,
    message: "get all user!"
})
  }
module.exports = { register,logout,login,alluser };
