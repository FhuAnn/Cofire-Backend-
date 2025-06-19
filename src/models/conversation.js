import mongoose, { model } from "mongoose";
const CofireExtension = mongoose.connection.useDb("CofireExtension");

const MessageScheme = new mongoose.Schema({
  role: { type: String, required: true, enum: ["ai", "user"] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  model: { type: String },
});

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  summary: { type: String, default: "" },
  messages: [MessageScheme],
  createAt: { type: Date, default: Date.now, required: true },
  updateAt: { type: Date, default: Date.now, required: true },
});

const Conversation = CofireExtension.model("Conversation", ConversationSchema);

export default Conversation;
