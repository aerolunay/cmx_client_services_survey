const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// 🔐 SECURITY
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const db = require("./config/dbconfig");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// 🔐 SECURITY MIDDLEWARE
// ===============================

// Hide Express signature
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// Body size protection
app.use(express.json({ limit: "1mb" }));

// CORS (from ENV)
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  ""
)
  .split(",")
  .map(o => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / server calls
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ===============================
// ☁️ AWS CONFIG
// ===============================
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// ===============================
// 📂 MULTER CONFIG (HARDENED)
// ===============================

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }

    cb(null, true);
  },
});

// ===============================
// 🧠 HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ===============================
// 🚀 SUBMIT SURVEY (HARDENED)
// ===============================

// tighter limiter for this route
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many submissions. Please try again later.",
});

app.post(
  "/submit-survey",
  submitLimiter,
  upload.array("attachments", 5),
  async (req, res) => {
    const connection = await db.getConnection();

    try {
      const {
        name,
        company,
        email,
        tasks,
        satisfaction,
        recommend,
        communication,
        collaboration,
        consistency,
        overall_comments,
        send_copy,
        survey_month,
        agent,
      } = req.body;

      // ===============================
      // 🔐 BASIC VALIDATION
      // ===============================
      if (!name || !company || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ===============================
      // 📂 UPLOAD FILES TO S3
      // ===============================
      let uploadedFiles = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

          const fileContent = fs.readFileSync(file.path);

          const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `clientsurveyattachments/${Date.now()}-${safeName}`,
            Body: fileContent,
            ContentType: file.mimetype,
          };

          const uploadResult = await s3.upload(params).promise();

          uploadedFiles.push({
            name: safeName,
            key: uploadResult.Key,
          });
        }
      }

      // ===============================
      // 💾 INSERT TO DATABASE
      // ===============================
      const sql = `
        INSERT INTO survey_responses (
          name, company, email, tasks,
          satisfaction, recommend, communication,
          collaboration, consistency, overall_comments,
          attachment_files, send_copy, survey_month, agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        name,
        company,
        email,
        tasks || null,
        satisfaction,
        recommend,
        communication,
        collaboration,
        consistency,
        overall_comments,
        JSON.stringify(uploadedFiles),
        send_copy ? 1 : 0,
        survey_month,
        agent,
      ];

      await connection.execute(sql, values);

      return res.json({ success: true });
    } catch (err) {
      console.error("❌ ERROR:", err);

      return res.status(500).json({
        error: "Internal server error",
      });
    } finally {
      // 🔥 CLEANUP FILES ALWAYS
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      connection.release();
    }
  }
);

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});