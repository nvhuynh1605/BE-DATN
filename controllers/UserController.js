const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the user's status is 0
    if (user.status === 0) {
      return res
        .status(403)
        .json({ message: "Your account is inactive. Please contact support." });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "12h",
    });
    res.json({ token, userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, phoneNum } = req.body;

    // Kiểm tra nếu người dùng đã tồn tại
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phoneNum,
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve user", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Bỏ qua mật khẩu khi trả về
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Access token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      phoneNum,
      role,
      status,
      currentPassword,
      newPassword,
    } = req.body;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Handle avatar update if a file is provided
    if (req.file) {
      const avatarUrl = req.file.path; // Assuming Cloudinary middleware adds `file.path`
      user.avatar = avatarUrl; // Update avatar URL
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isPasswordMatch = await user.comparePassword(currentPassword); // Assuming a `comparePassword` method exists
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      user.password = newPassword; // Set the new password (ensure you hash it in the `pre-save` hook)
    }

    // Update other fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.phoneNum = phoneNum || user.phoneNum;
    user.role = role || user.role;
    user.status = status !== undefined ? status : user.status;

    // Save updated user
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { phoneNum: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi tìm kiếm", error: error.message });
  }
};

module.exports = {
  login,
  register,
  getAllUser,
  getUserById,
  authenticateToken,
  updateUser,
  deleteUser,
  searchUser,
};
