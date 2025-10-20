// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Events listeners
require("./events/listeners");

// Middlewares
const errorHandler = require("./middlewares/errorMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");

// Routes
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);
app.use(rateLimiter);

// Home route
app.get('/', (req, res) => {
  res.send('<h1 style="color: blue">This is Stello</h1>');
});

// Use external routes
app.use("/auth", authRoutes);


module.exports = app;