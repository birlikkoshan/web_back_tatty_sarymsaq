const express = require("express");
const { getCollection } = require("../database/mongo");

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
router.post("/contact", async (req, res) => {
  // Validate form data
  const validationErrors = validateContactForm(req.body);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors,
    });
  }

  try {
    const submissionsCollection = await getCollection("submissions");

    const newEntry = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      message: req.body.message.trim(),
      time: new Date().toISOString(),
    };

    const result = await submissionsCollection.insertOne(newEntry);

    res.status(201).json({
      success: true,
      message: `Thanks, ${newEntry.name}! Your message has been received.`,
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Error saving submission:", err);
    return res.status(500).json({ error: "Error saving submission" });
  }
});

module.exports = router;
