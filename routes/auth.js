const express = require("express");
const bcrypt = require("bcrypt");
const { getCollection } = require("../database/mongo");

const router = express.Router();

const USERS = "users";

function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const e = email.trim();
  return e.length >= 3 && e.includes("@") && e.includes(".");
}

function isValidPassword(pw) {
  return typeof pw === "string" && pw.length >= 8;
}

// POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const firstname =
      typeof req.body.firstname === "string" ? req.body.firstname.trim() : "";
    const emailRaw = req.body.email;
    const password = req.body.password;

    const email = normalizeEmail(emailRaw);

    const errors = [];
    if (!firstname) errors.push("Firstname is required");
    if (!isValidEmail(email)) errors.push("Email is invalid");
    if (!isValidPassword(password))
      errors.push("Password must be at least 8 characters");

    if (errors.length) {
      return res.status(400).json({ error: "Bad Request", details: errors });
    }

    const users = await getCollection(USERS);

    const existing = await users.findOne({ email });
    if (existing) {
      // avoid user enumeration with detailed errors; still a 400 is OK for signup
      return res.status(400).json({
        error: "Bad Request",
        details: ["Email is already registered"],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const now = new Date();
    const result = await users.insertOne({
      firstname,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    // auto-login after registration
    req.session.userId = String(result.insertedId);
    req.session.email = email;
    req.session.firstname = firstname;

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Error in POST /api/signup:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "Bad Request" });
    }

    const users = await getCollection(USERS);
    const user = await users.findOne({ email });

    // generic message for security
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = String(user._id);
    req.session.email = user.email;
    req.session.firstname = user.firstname;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in POST /api/login:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/logout
router.post("/logout", (req, res) => {
  // destroy session if exists
  if (!req.session) return res.status(200).json({ ok: true });

  req.session.destroy((err) => {
    if (err) {
      console.error("Error in POST /api/logout:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.clearCookie(process.env.SESSION_COOKIE_NAME || "sid");
    return res.status(200).json({ ok: true });
  });
});

// GET /api/me
router.get("/me", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    user: {
      id: req.session.userId,
      email: req.session.email,
      firstname: req.session.firstname,
    },
  });
});

module.exports = router;
