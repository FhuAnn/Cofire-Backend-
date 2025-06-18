import mongoose from "mongoose";
const CofireExtension = mongoose.connection.useDb("CofireExtension");

const MessageScheme = new mongoose.Schema({
  role: { type: String, required: true, enum: ["ai", "user"] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
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
  messages: [MessageScheme],
  createAt: { type: Date, default: Date.now, required: true },
  updateAt: { type: Date, default: Date.now, required: true },
});

const Conversation = CofireExtension.model("Conversation", ConversationSchema);

export default Conversation;
