import connectToDb from "../config/db.js";
import Conversation from "../models/conversation.js";

class HistoryController {
  async createOrUpdateMessage(req, res) {
    await connectToDb();
    try {
      const { userId, conversationId, role, content } = req.body;
      if (!userId || !role || !content) {
        return res.status(400).json({
          success: false,
          message: "UserId, Role and Content are required",
        });
      }
      let conversation;
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
        if (!conversation)
          return res.status(404).json({
            success: false,
            message: `Conversation (${conversationId})not found`,
          });
        conversation.messages.push({ role, content });
        conversation.updateAt = new Date();
        await conversation.save();
      } else {
        conversation = new Conversation({
          userId,
          title: content.slice(0, 30),
          messages: [{ role, content }],
        });
        await conversation.save();
      }
      return res.status(200).json({
        success: true,
        message: `Conversation ${conversationId}created/updated successfully`,
        data: conversation,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error creating history",
        error: error.message,
      });
    }
  }

  async getConversationList(req, res) {
    await connectToDb();
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }
      const conversationList = await Conversation.find({ userId })
        .select("-messages") // bỏ qua trường messages để chỉ lấy thông tin cơ bản
        .sort({
          updateAt: -1,
        });
      return res.status(200).json({
        success: true,
        message: "Conversation history retrieved successfully",
        data: conversationList,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving conversation history",
        error: error.message,
      });
    }
  }

  async getConversationDetail(req, res) {
    await connectToDb();
    try {
      const { conversationId } = req.query;
      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message: "Conversation ID is required",
        });
      }
      const conversation = await Conversation.findById(conversationId).sort({
        updateAt: 1});
      if (!conversation)
        return res.status(404).json({
          success: false,
          message: `Conversation (${conversationId}) not found`,
        });

      return res.status(200).json({
        success: true,
        message: `Messages in conversation(${conversationId}) retrieved successfully`,
        data: conversation.messages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error retrieving messages in conversation (${conversationId})`,
        error: error.message,
      });
    }
  }
  async getFirstConversation(req, res) {
    await connectToDb();
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Conversation ID is required",
        });
      }
      const conversation = await Conversation.findOne({ userId }).sort({
        update: -1,
      });
      if (!conversation)
        return res.status(404).json({
          success: false,
          message: `No conversation found for user (${userId})`,
        });

      return res.status(200).json({
        success: true,
        message: `First conversation for user (${userId}) retrieved successfully`,
        data: conversation,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error retrieving first conversation for user (${req.query.userId})`,
        error: error.message,
      });
    }
  }
}

export default new HistoryController();
