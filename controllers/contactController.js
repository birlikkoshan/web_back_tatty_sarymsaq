const { validateContactForm } = require("../utils");
const { insertSubmission } = require("../models/Submission");

async function submit(req, res) {
  const validationErrors = validateContactForm(req.body);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors,
    });
  }

  try {
    const newEntry = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      message: req.body.message.trim(),
      time: new Date().toISOString(),
    };

    const result = await insertSubmission(newEntry);

    res.status(201).json({
      success: true,
      message: `Thanks, ${newEntry.name}! Your message has been received.`,
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Error saving submission:", err);
    return res.status(500).json({ error: "Error saving submission" });
  }
}

module.exports = {
  submit,
};
