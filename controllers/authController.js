const bcrypt = require("bcrypt");
const config = require("../config");
const { findUserByEmail, insertUser, findUsersByRole } = require("../models/User");

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

async function signup(req, res) {
  try {
    const firstname =
      typeof req.body.firstname === "string" ? req.body.firstname.trim() : "";
    const surname =
      typeof req.body.surname === "string" ? req.body.surname.trim() : "";
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const role = "student";

    const errors = [];
    if (!firstname) errors.push("Firstname is required");
    if (!surname) errors.push("Surname is required");
    if (!isValidEmail(email)) errors.push("Email is invalid");
    if (!isValidPassword(password))
      errors.push("Password must be at least 8 characters");

    if (errors.length) {
      return res.status(400).json({ error: "Bad Request", details: errors });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        error: "Bad Request",
        details: ["Email is already registered"],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const result = await insertUser({
      firstname,
      surname,
      email,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    });

    req.session.userId = String(result._id);
    req.session.email = email;
    req.session.firstname = firstname;
    req.session.surname = surname;

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Error in POST /api/signup:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "Bad Request" });
    }

    const user = await findUserByEmail(email);
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
    req.session.surname = user.surname || "";
    req.session.role = user.role;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in POST /api/login:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

function logout(req, res) {
  if (!req.session) return res.status(200).json({ ok: true });

  req.session.destroy((err) => {
    if (err) {
      console.error("Error in POST /api/logout:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.clearCookie(config.sessionCookieName);
    return res.status(200).json({ ok: true });
  });
}

function me(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    user: {
      id: req.session.userId,
      email: req.session.email,
      firstname: req.session.firstname,
      surname: req.session.surname || "",
      role: req.session.role || "student",
    },
  });
}

async function listInstructors(req, res) {
  try {
    const docs = await findUsersByRole("instructor", {
      firstname: 1,
      surname: 1,
      email: 1,
    });
    const list = docs.map((u) => ({
      name: [u.firstname, u.surname].filter(Boolean).join(" ").trim() || u.email,
      email: u.email || "",
    }));
    return res.status(200).json(list);
  } catch (err) {
    console.error("Error in GET /api/instructors:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  signup,
  login,
  logout,
  me,
  listInstructors,
};
