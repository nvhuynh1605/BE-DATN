const express = require("express");
const router = express.Router();
const {
  getAllFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackByUserId,
  searchFeedback
} = require("../controllers/FeedbackController");

router.get('/feedback/user/:userId', getFeedbackByUserId);
router.post("/feedback", createFeedback);
router.get('/feedback/search', searchFeedback);
router.get("/feedback", getAllFeedback);
router.put("/feedback/:id", updateFeedback);
router.delete("/feedback/:id", deleteFeedback);

module.exports = router;
