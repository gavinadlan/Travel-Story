console.log("Starting server initialization...");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");

require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { authenticateToken } = require("./utilities");
const cloudinary = require("cloudinary").v2;
const cache = require("memory-cache");

const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");

const app = express();

// SETUP MULTER UNTUK UPLOAD
const upload = multer({ storage: multer.memoryStorage() });

// SETUP EXPRESS DAN CORS
app.use(express.json({ limit: "10mb" }));

// Middleware untuk logging request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  "https://travel-story-alpha.vercel.app",
  "http://localhost:3000",
  "https://travel-story-tx4c.onrender.com",
];

// Enhanced CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
console.log("Cloudinary configured");

// =====================================
// ENDPOINT UPLOAD GAMBAR KE CLOUDINARY
// =====================================
app.post("/upload-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res
        .status(400)
        .json({ error: true, message: "No image uploaded" });
    }

    // Upload ke Cloudinary
    cloudinary.uploader.upload(
      `data:image/jpeg;base64,${image}`,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ error: true, message: "Failed to upload image" });
        }
        res.json({ imageUrl: result.secure_url });
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  let dbPing = false;
  try {
    await mongoose.connection.db.admin().ping();
    dbPing = true;
  } catch (e) {
    console.error("DB ping failed:", e);
  }

  res.json({
    status: dbPing ? "ok" : "degraded",
    database: dbStatus,
    dbPing: dbPing,
    uptime: process.uptime(),
  });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  const isUser = await User.findOne({ _id: userId });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: isUser,
    message: "",
  });
});

// Create Account (Register)
app.post("/create-account", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validasi input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "Full name, email, and password are required",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      error: false,
      message: "Registration successful",
      user: { fullName: newUser.fullName, email: newUser.email },
      accessToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.json({
      error: false,
      message: "Login Successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  try {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // Validation
    if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
      return res
        .status(400)
        .json({ error: true, message: "All fields required" });
    }

    const newStory = await TravelStory.create({
      title,
      story,
      visitedLocation,
      imageUrl,
      visitedDate: new Date(visitedDate),
      userId,
    });

    res.status(201).json(newStory);
  } catch (error) {
    console.error("Add Story Error:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// Get All Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const cacheKey = `stories-${userId}`;

  const cached = cache.get(cacheKey);
  if (cached) return res.json({ stories: cached, fromCache: true });

  try {
    const stories = await TravelStory.find({ userId }).sort({
      isFavourite: -1,
    });
    cache.put(cacheKey, stories, 300000); // Cache 5 menit
    res.json({ stories });
  } catch (error) {
    // Fallback to cache if available
    if (cache.get(cacheKey)) {
      return res.json({ stories: cache.get(cacheKey), fromCache: true });
    }
    res.status(500).json({ error: true, message: error.message });
  }
});

// Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    const storyToUpdate = await TravelStory.findOne({
      _id: id,
      userId,
    });

    if (!storyToUpdate) {
      return res.status(404).json({
        error: true,
        message: "Story not found",
      });
    }

    const oldImageUrl = storyToUpdate.imageUrl;
    storyToUpdate.title = title || storyToUpdate.title;
    storyToUpdate.story = story || storyToUpdate.story;
    storyToUpdate.visitedLocation =
      visitedLocation || storyToUpdate.visitedLocation;
    storyToUpdate.imageUrl = imageUrl || storyToUpdate.imageUrl;
    storyToUpdate.visitedDate = visitedDate
      ? new Date(visitedDate)
      : storyToUpdate.visitedDate;

    await storyToUpdate.save();

    // Hanya log perubahan gambar (tidak perlu hapus fisik)
    if (oldImageUrl !== imageUrl) {
      console.log(`Gambar diubah dari ${oldImageUrl} menjadi ${imageUrl}`);
    }

    res.json({
      success: true,
      story: storyToUpdate,
    });
  } catch (error) {
    console.error("Edit story error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Delete a travel story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const story = await TravelStory.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!story) {
      return res.status(404).json({
        error: true,
        message: "Story not found",
      });
    }

    // Tidak perlu hapus gambar dari Cloudinary
    console.log(`Story dihapus, gambar: ${story.imageUrl}`);

    res.json({
      success: true,
      message: "Story deleted",
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavourite } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }

    travelStory.isFavourite = isFavourite;

    await travelStory.save();
    res.status(200).json({ story: travelStory, message: "Update Succesful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Search travel stories
app.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) {
    return res.status(400).json({ error: true, message: "Query is required" });
  }

  try {
    const searchResults = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories: searchResults });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Filter travel stories by date range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: true,
      message: "Start date and end date are required",
    });
  }

  try {
    // Convert startDate and endDate from milliseconds to Date objects
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    // Find travel stories that belong to the authenticated user and fall within the date range
    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories: filteredStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.name === "MongoServerError" || err.name === "MongoNetworkError") {
    console.error("Database error:", err);
    return res.status(503).json({
      error: true,
      message: "Database service unavailable. Please try again later.",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: true,
      message: "Invalid token",
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: true,
    message: "Internal server error",
  });
});

// =====================================
// DATABASE CONNECTION & SERVER START
// =====================================
mongoose
  .connect(process.env.MONGODB_URI || config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
