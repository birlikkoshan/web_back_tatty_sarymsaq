const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Helper function to validate contact form data
function validateContactForm(data) {
  const errors = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required");
  }
  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required");
  }
  if (!data.message || data.message.trim() === "") {
    errors.push("Message is required");
  }

  // Basic email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Email format is invalid");
  }

  return errors;
}

// POST /contact - Handle contact form submissions
router.post("/contact", (req, res) => {
  // Validate form data
  const validationErrors = validateContactForm(req.body);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors,
    });
  }

  const filePath = path.join(__dirname, "../submissions.json");

  const newEntry = {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    message: req.body.message.trim(),
    time: new Date().toISOString(),
  };

  fs.readFile(filePath, "utf8", (err, data) => {
    let submissions = [];

    if (!err && data) {
      try {
        submissions = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing submissions.json:", e);
      }
    }

    submissions.push(newEntry);

    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error saving submission" });
      }

      res.status(201).json({
        success: true,
        message: `Thanks, ${newEntry.name}! Your message has been received.`,
      });
    });
  });
});

module.exports = router;
