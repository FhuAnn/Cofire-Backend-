import mongoose, { model } from "mongoose";
const CofireExtension = mongoose.connection.useDb("CofireExtension");

const FileToSendSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  relativePath: { type: String, required: true },
  //selectedCode: { type: String },
  //code: { type: String },
  selectionStart: { type: Number },
  selectionEnd: { type: Number },
  selectionStartCharacter: { type: Number },
  selectionEndCharacter: { type: Number },
});

const MessageSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ["ai", "user"] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  model: { type: String },
  attaches: [FileToSendSchema],
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
  messages: [MessageSchema],
  createAt: { type: Date, default: Date.now, required: true },
  updateAt: { type: Date, default: Date.now, required: true },
});

const Conversation = CofireExtension.model("Conversation", ConversationSchema);

export default Conversation;
