require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send("Welcome to LearnPath-AI!");
});

// connect to mongoDB
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("connected to MONGODB");
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
