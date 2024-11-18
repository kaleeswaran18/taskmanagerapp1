const mongoose=require("mongoose")
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);
const db=mongoose.connection;
db.once('open',function(){console.log("db is connected")})
db.on('error',console.error.bind(console,"db is not connect"))
