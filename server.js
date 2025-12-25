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

// Search route: uses query parameter `q`
app.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  if (!q) {
    return res.send(
      `<h2>Search</h2><form method="get" action="/search"><input name="q" placeholder="search..."><button>Search</button></form>`
    );
  }

  const viewDir = path.join(__dirname, "views");
  fs.readdir(viewDir, (err, files) => {
    if (err) return res.status(500).send("Server error");

    const matches = files
      .filter((f) => f.toLowerCase().includes(q))
      .map((f) => ({ id: path.parse(f).name, name: f }));

    if (matches.length === 0) {
      return res.send(
        `<h2>No results for "${q}"</h2><p><a href="/">Back</a></p>`
      );
    }

    const list = matches
      .map((m) => `<li><a href="/item/${encodeURIComponent(m.id)}">${m.name}</a></li>`)
      .join("");

    res.send(`<h2>Results for "${q}"</h2><ul>${list}</ul><p><a href="/">Back</a></p>`);
  });
});

// Item route: uses route parameter `id`
app.get("/item/:id", (req, res) => {
  const id = req.params.id;
  const candidate = path.join(__dirname, "views", id + ".html");

  fs.access(candidate, fs.constants.R_OK, (err) => {
    if (!err) return res.sendFile(candidate);

    const itemsPath = path.join(__dirname, "items.json");
    fs.readFile(itemsPath, "utf8", (err, data) => {
      if (!err && data) {
        try {
          const items = JSON.parse(data);
          const item = items.find((it) => String(it.id) === id || it.id === id);
          if (item) {
            return res.send(
              `<h2>${item.title || "Item"}</h2><pre>${JSON.stringify(item, null, 2)}</pre><p><a href="/">Home</a></p>`
            );
          }
        } catch (e) {}
      }

      res.send(
        `<h2>Item ${id}</h2><p>No detailed page found. Create views/${id}.html or add to items.json</p><p><a href="/">Home</a></p>`
      );
    });
  });
});

// API info route: returns project info in JSON
app.get("/api/info", (req, res) => {
  const pkgPath = path.join(__dirname, "package.json");
  fs.readFile(pkgPath, "utf8", (err, data) => {
    if (err) {
      return res.json({
        name: path.basename(__dirname),
        routes: ["/", "/search", "/item/:id", "/contact", "/api/info"],
      });
    }

    try {
      const pkg = JSON.parse(data);
      return res.json({
        name: pkg.name || path.basename(__dirname),
        version: pkg.version,
        description: pkg.description,
        routes: ["/", "/search", "/item/:id", "/contact", "/api/info"],
      });
    } catch (e) {
      return res.status(500).json({ error: "invalid package.json" });
    }
  });
});

app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/views/not_found.html");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
