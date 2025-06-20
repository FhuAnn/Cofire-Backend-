import express from "express";
const router = express.Router();
import historyController from "../controllers/HistoryController.js";

router.use(express.json());

// router.use("/getConversationList")
// router.use("/getConversationDetail")
router.use("/message", historyController.createOrUpdateMessage);
router.use("/deleteConversation", historyController.deleteConversation);
router.use("/getConversationList", historyController.getConversationList);
router.use("/getConversationDetail", historyController.getConversationDetail);
router.use(
  "/getFirstConversation",
  historyController.getFirstConversation
);

export default router;
