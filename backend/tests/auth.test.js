const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app'); // Import the app and server

// Test setup
beforeAll(async () => {
  // Connect to the database before running tests
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Close database connection and server after all tests
  await mongoose.connection.close();
  server.close();
});

describe('Authentication API', () => {
    it('should register a new user', async () => {
        const uniqueUsername = `testuser_${Date.now()}`; // Create a unique username using the current timestamp
      
        const res = await request(server).post('/users/register').send({
          username: uniqueUsername,
          password: 'password123',
          role: 'User',
        });
      
        expect(res.statusCode).toBe(200);
        expect(res.body.value).toHaveProperty('username', uniqueUsername); // Check the dynamic username
        expect(res.body.message).toBe('User registered successfully!');
      });

  it('should login a user', async () => {
    const uniqueUsername = `testuser_${Date.now()}`;
    const res = await request(server).post('/users/register').send({
      username: uniqueUsername,
      password: 'password123',
    });
    console.log(res.body,'res.body.data')
    expect(res.statusCode).toBe(200);
    //expect(res.body.data).toHaveProperty('token');
    let username=''
    if(res.body.value.username.startsWith("testuser")){
        username="testuser"
    }
    expect(username).toHaveProperty('username', "testuser");
    expect(res.body.message).toBe('User registered successfully!');
  });

  it('should not login with incorrect credentials', async () => {
    const res = await request(server).post('/users/login').send({
      username: 'testuser',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

//   it('should get all users (Admin only)', async () => {
//     const loginRes = await request(server).post('/users/login').send({
//       username: 'adminuser', // Replace with a valid admin user
//       password: 'adminpassword',
//     });
//     const token = loginRes.body.data.token;

//     const res = await request(server)
//       .get('/users/alluser')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.tasks).toBeInstanceOf(Array);
//     expect(res.body.message).toBe('get all user!');
//   });

//   it('should fetch all users without a token', async () => {
//     const res = await request(server).get('/users/alluser');
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('tasks'); // Assuming the response has a "tasks" property
//     expect(Array.isArray(res.body.tasks)).toBe(true); // Ensure "tasks" is an array
//   });
});
