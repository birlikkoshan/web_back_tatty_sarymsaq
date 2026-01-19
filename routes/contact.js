const express = require("express");
const { getCollection } = require("../database/mongo");
const { validateContactForm } = require("../utils");

const router = express.Router();

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
