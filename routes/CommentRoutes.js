const express = require("express");
const router = express.Router();
const {
  getAllComment,
  createComment,
  updateComment,
  deleteComment,
  getCommentByUserId,
  getCommentsByProductId
} = require("../controllers/CommentController");

router.get('/comment/product/:productId', getCommentsByProductId);
router.get('/comment/user/:userId', getCommentByUserId);
router.post("/comment", createComment);
router.get("/comment", getAllComment);
router.put("/comment/:id", updateComment);
router.delete("/comment/:id", deleteComment);

module.exports = router;
