import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function connectToDb() {
  const uri = process.env.DB_URI;

  await mongoose
    .connect(uri, {})
    .then(() => {
      console.log("successfully DB connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

export default connectToDb;
