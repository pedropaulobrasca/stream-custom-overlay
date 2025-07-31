import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "images");
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: AuthenticatedRequest, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `action-${req.user!.userId}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
  }
});

// Upload image endpoint
router.post("/image", upload.single("image"), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Generate URL for the uploaded file
    const imageUrl = `/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;