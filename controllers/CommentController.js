const Comment = require("../models/Comment");

const getAllComment = async (req, res) => {
  try {
    const comment = await Comment.find().populate("user", "-password").populate("product");

    res.json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve comment", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { userId, content, product } = req.body;

    const comment = new Comment({ user: userId, content, product });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create comment", error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    ).populate("user", "-password");

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update comment", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};

const getCommentByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const comment = await Comment.find({ user: userId }).populate("user", "-password");

    if (!comment || comment.length === 0) {
      return res.status(404).json({ message: "No comment found for this user" });
    }

    res.json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve comment", error: error.message });
  }
};

const getCommentsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ product: productId }).populate("user", "-password")
    
    if (!comments) {
      return res.status(404).json({ message: 'No comments found for this product.' });
    }

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllComment, createComment, updateComment, deleteComment, getCommentByUserId, getCommentsByProductId };
