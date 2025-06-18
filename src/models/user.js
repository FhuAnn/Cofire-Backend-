import mongoose from "mongoose";
mongoose.set("debug", true);

const userSchema = mongoose.connection.useDB("CofireSupport");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    require: true,
  },
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
    require: true,
  },
});

module.exports = userSchema.model("User", UserSchema);
