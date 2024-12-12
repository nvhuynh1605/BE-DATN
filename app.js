// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const productRoutes = require('./routes/ProductRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const orderRoutes = require('./routes/OrderRoutes')
const userRoutes = require('./routes/UserRoutes')
const feedbackRoutes = require("./routes/FeedbackRoutes")
const commentRoutes = require("./routes/CommentRoutes")
const statisticalRoutes = require("./routes/StatisticalRoutes")
const newsRoutes = require("./routes/NewsRoutes")

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());


app.use(cors());

// Routes
app.use('/api/items', itemRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', commentRoutes);
app.use('/api', statisticalRoutes);
app.use('/api', newsRoutes);

module.exports = app;
