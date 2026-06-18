const mongoose=require("mongoose")
require('dotenv').config()
database=process.env.DATABASE_URL
const url=database
module.exports.connect=()=>{
    console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);
    mongoose.connect(url,{
    family: 4,
    serverSelectionTimeoutMS: 10000,
    ssl: true,
  }).then(() =>console.log("Databse is connected"))
  .catch((err) => console.log("DB Error:", err));
};