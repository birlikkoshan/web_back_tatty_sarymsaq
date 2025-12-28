const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// POST /contact - Handle contact form submissions
router.post("/contact", (req, res) => {
  const filePath = path.join(__dirname, "../submissions.json");

  const newEntry = {
    ...req.body,
    time: new Date().toISOString(),
  };

  fs.readFile(filePath, "utf8", (err, data) => {
    let submissions = [];

    if (!err && data) {
      submissions = JSON.parse(data);
    }

    submissions.push(newEntry);

    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving data");
      }

      res.send(
        `<h2>Thanks, ${req.body.name}! Your message has been received.</h2>`
      );
    });
  });
});

module.exports = router;
