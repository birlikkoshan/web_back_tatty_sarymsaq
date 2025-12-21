const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html");
});

app.get("/contact", (req, res) => {
  res.sendFile(__dirname + "/views/contact.html");
});

app.post("/contact", (req, res) => {
  const filePath = path.join(__dirname, "submissions.json");

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

app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/views/not_found.html");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
