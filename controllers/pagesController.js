const path = require("path");

const VIEWS_DIR = path.join(__dirname, "../views");

function home(req, res) {
  res.sendFile(path.join(VIEWS_DIR, "index.html"));
}

function about(req, res) {
  res.sendFile(path.join(VIEWS_DIR, "about.html"));
}

function contactPage(req, res) {
  res.sendFile(path.join(VIEWS_DIR, "contact.html"));
}

function loginPage(req, res) {
  res.sendFile(path.join(VIEWS_DIR, "login.html"));
}

function signupPage(req, res) {
  res.sendFile(path.join(VIEWS_DIR, "signup.html"));
}

module.exports = {
  home,
  about,
  contactPage,
  loginPage,
  signupPage,
};
