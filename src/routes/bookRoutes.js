import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js"; // Ensure the .js extension is included
import protectRoute from "../middleware/auth.middleware.js"; // Corrected to default import

const router = express.Router();

// POST route to create a new book
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, author, genre, image } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      image,
      user: req.user._id, // Assuming `protectRoute` adds `req.user`
    });

    await newBook.save();

    res
      .status(201)
      .json({ message: "Book created successfully", book: newBook });
  } catch (error) {
    console.error("Error in create book route", error);
    res.status(500).json({ message: "Error creating book" });
  }
});

// GET route for pagination (infinite loading)
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Ensure page is a number
    const limit = parseInt(req.query.limit, 10) || 20; // Ensure limit is a number
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage"); // Populate user details

    const total = await Book.countDocuments();

    res.status(200).json({
      books,
      currentPage: page,
      totalBooks: total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in get all books route", error);
    res.status(500).json({ message: "An error occurred while fetching books" });
  }
});

// GET route to fetch books for a specific user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(books);
  } catch (error) {
    console.error("Get user books error", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE route to delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book belongs to the user
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete image from Cloudinary if it exists
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (deleteError) {
        console.error("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error in delete book route", error);
    res.status(500).json({ message: "Error deleting book" });
  }
});

export default router;
