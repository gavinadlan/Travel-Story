require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");

mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());

// Middleware untuk logging request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// Serve static files
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exixts" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  );

  return res.status(200).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registration successful",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  );

  return res.json({
    error: false,
    message: "Login Successful",
    user: { fullName: user.fullName, email: user.email },
    accessToken,
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

// Image Upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: "No image uploaded",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
  try {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({
        error: true,
        message: "Image URL is required",
      });
    }

    const decodedUrl = decodeURIComponent(imageUrl);
    const parsedUrl = new URL(decodedUrl);

    // Validasi domain dan path
    if (
      !parsedUrl.pathname.startsWith("/uploads/") ||
      !parsedUrl.hostname.includes("travel-story-tx4c.onrender.com")
    ) {
      return res.status(400).json({
        error: true,
        message: "Invalid image URL",
      });
    }

    const filename = path.basename(parsedUrl.pathname);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: "Image deleted",
      });
    }

    return res.status(404).json({
      error: true,
      message: "Image not found",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  try {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    // Validasi tipe data
    if (
      typeof title !== "string" ||
      typeof story !== "string" ||
      typeof visitedLocation !== "string" ||
      typeof imageUrl !== "string" ||
      isNaN(new Date(visitedDate).getTime())
    ) {
      return res.status(400).json({
        error: true,
        message: "Invalid input format",
      });
    }

    const newStory = await TravelStory.create({
      title,
      story,
      visitedLocation,
      imageUrl,
      visitedDate: new Date(visitedDate),
      userId,
    });

    res.status(201).json({
      success: true,
      story: newStory,
    });
  } catch (error) {
    console.error("Add story error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Get All Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavourite: -1,
    });

    res.status(200).json({ stories: travelStories });
  } catch (error) {
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

    // Simpan URL gambar lama untuk cleanup
    const oldImageUrl = storyToUpdate.imageUrl;

    // Update field
    storyToUpdate.title = title || storyToUpdate.title;
    storyToUpdate.story = story || storyToUpdate.story;
    storyToUpdate.visitedLocation =
      visitedLocation || storyToUpdate.visitedLocation;
    storyToUpdate.imageUrl = imageUrl || storyToUpdate.imageUrl;
    storyToUpdate.visitedDate = visitedDate
      ? new Date(visitedDate)
      : storyToUpdate.visitedDate;

    await storyToUpdate.save();

    // Hapus gambar lama jika diganti
    if (oldImageUrl !== imageUrl && oldImageUrl.includes("/uploads/")) {
      try {
        const parsedUrl = new URL(oldImageUrl);
        const filename = path.basename(parsedUrl.pathname);
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error("Gagal menghapus gambar lama:", cleanupError);
      }
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

    // Hapus gambar hanya jika dari uploads
    if (story.imageUrl.includes("/uploads/")) {
      try {
        const parsedUrl = new URL(story.imageUrl);
        const filename = path.basename(parsedUrl.pathname);
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error("Gagal menghapus gambar:", cleanupError);
      }
    }

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
    return res.status(404).json({ error: true, message: "query is required" });
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

  try {
    // Convert startDate and endDate from milliseconds to Date objects
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    // Find travel stories that belong to the authenticated user and fall within the
    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories: filteredStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
