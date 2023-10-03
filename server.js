const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("express-session"); // here express-session is used to add session so that un-authorized user can not access the directory
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Use sessions to track user authentication
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Use your own database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Serve login form
app.get("/", (req, res) => {
  res.sendFile(path.resolve("../frontend/index.html"));
});
// Serve Homepage
app.get("/", (req, res) => {
    res.sendFile(path.resolve("../frontend/index.html"));
  });
  
// Handle login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Replace with your SQL query to validate the user's login
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.length === 1) {
      // Store user authentication status in the session
      req.session.authenticated = true;
      res.redirect("/dashboard");
    } else {
      res.send("Login failed. Check your credentials.");
    }
  });
});

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.authenticated) {
    next(); // User is authenticated, proceed to the next middleware/route
  } else {
    res.send("Access denied. Please log in first.");
  }
};

// Serve dashboard (only accessible to authenticated users)
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.resolve("../frontend/dashboard.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
