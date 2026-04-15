const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");

const db = require("./config/dbconfig");

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["https://voc.cmxph.com", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

/* ---------------- AWS CONFIG ---------------- */

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const SURVEY_BUCKET = "cmxclientescalationfiles";

/* ---------------- FILE UPLOAD ---------------- */

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("Survey API Running");
});

/* ---------------- SUBMIT SURVEY ---------------- */

app.post("/submit-survey", upload.array("files", 10), async (req, res) => {
  try {
    console.log("📩 Survey submission received");
    console.log("FILES RECEIVED:", req.files);
    console.log("BODY RECEIVED:", req.body);

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
      sendCopy,
      survey_month,   
      agent,      
    } = req.body;

    console.log("👤 Respondent:", name, "|", email);
    console.log("🏢 Company:", company);

    /* ---------- VALIDATE REQUIRED FIELDS ---------- */

    if (
      !name?.trim() ||
      !company?.trim() ||
      !email?.trim() ||
      !tasks?.trim() ||
      !satisfaction ||
      recommend === undefined ||
      recommend === null ||
      recommend === "" ||
      !communication ||
      !collaboration ||
      !consistency
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    /* ---------- CONVERT VALUES ---------- */

    const satisfactionValue = parseInt(satisfaction, 10);
    const recommendValue = parseInt(recommend, 10);
    const communicationValue = parseInt(communication, 10);
    const collaborationValue = parseInt(collaboration, 10);
    const consistencyValue = parseInt(consistency, 10);

    const sendCopyValue = sendCopy === "true" || sendCopy === true ? 1 : 0;
    const overallCommentsValue = overall_comments?.trim() || null;

    let uploadedFiles = [];

    /* ---------- UPLOAD FILES TO S3 ---------- */

    if (req.files && req.files.length > 0) {
      console.log(`📂 ${req.files.length} file(s) detected for upload`);

      for (const file of req.files) {
        const fileKey = `clientsurveyattachments/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}-${file.originalname}`;

        console.log("⬆️ Uploading file to S3:", file.originalname);

        const uploadResult = await s3
          .upload({
            Bucket: SURVEY_BUCKET,
            Key: fileKey,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
            ACL: "private",
          })
          .promise();

        console.log("✅ File uploaded:", uploadResult.Key);

        uploadedFiles.push(uploadResult.Key);

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    } else {
      console.log("📭 No files uploaded");
    }

    /* ---------- CONVERT FILES TO STRING ---------- */

    const attachmentsString = uploadedFiles.join(",");

    console.log("📎 Attachments saved:", attachmentsString);
    console.log("📝 Overall comments:", overallCommentsValue);

    /* ---------- SAVE TO DATABASE ---------- */

    const sql = `
      INSERT INTO 1006_customer_survey_system.survey_responses
      (
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
        attachment_files,
        send_copy,
        survey_month,
        agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      name.trim(),
      company.trim(),
      email.trim(),
      tasks.trim(),
      satisfactionValue,
      recommendValue,
      communicationValue,
      collaborationValue,
      consistencyValue,
      overallCommentsValue,
      attachmentsString || null,
      sendCopyValue,
      survey_month || null,
      agent || null,
    ]);

    console.log("✅ Survey saved with ID:", result.insertId);

    res.json({
      success: true,
      message: "Survey submitted successfully",
      surveyId: result.insertId,
      uploadedFiles,
    });
  } catch (error) {
    console.error("❌ Survey submission error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* ---------------- MULTER ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum allowed size is 100MB.",
      });
    }
  }

  next(err);
});

/* ---------------- SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`🚀 Survey server running on port ${PORT}`);
});