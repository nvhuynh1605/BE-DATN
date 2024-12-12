const Feedback = require("../models/Feedback");

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate("user", "-password");

    res.json(feedback);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve feedback", error: error.message });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { userId, content, email, phoneNum } = req.body;

    const feedback = new Feedback({ user: userId, content, email, phoneNum });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create feedback", error: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { content } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { content },
      { new: true }
    ).populate("user", "-password");

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update feedback", error: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete feedback", error: error.message });
  }
};

const getFeedbackByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const feedback = await Feedback.find({ user: userId }).populate("user", "-password");

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({ message: "No feedback found for this user" });
    }

    res.json(feedback);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve feedback", error: error.message });
  }
};

module.exports = { getAllFeedback, createFeedback, updateFeedback, deleteFeedback, getFeedbackByUserId };
