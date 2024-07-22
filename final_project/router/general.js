const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registering a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  // Create new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json({ books: JSON.stringify(books, null, 2) });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).json({ books: booksByAuthor });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).json({ books: filteredBooks });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
  return res.status(200).json({ reviews: book.reviews });
});

module.exports.general = public_users;
