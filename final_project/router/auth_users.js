const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Placeholder function to check if username is valid
  return username.length >= 4; // Example validation (can be more complex)
};

const authenticatedUser = (username, password) => {
  // Placeholder function to authenticate user
  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ username }, "your_secret_key_here", { expiresIn: '1h' });
  req.session.token = token;
  return res.status(200).json({ token });
});

// Add a book review (authentication required)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  jwt.verify(token, "your_secret_key_here", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }
    const { username } = decoded;

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
  });
});

// Delete a book review (authentication required)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  jwt.verify(token, "your_secret_key_here", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }
    const { username } = decoded;

    const book = books[isbn];
    if (!book || !book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
