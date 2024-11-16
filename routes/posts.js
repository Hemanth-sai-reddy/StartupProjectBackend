const express = require('express');
const Post = require('../models/Posts');
const multer = require('multer');
const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

//Comment on a post
router.post("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push(req.body.comment);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment" });
  }
});


// Create a post
router.post('/', upload.single('image'), async (req, res) => {
  const { title, description, tags } = req.body;
  const parsedTags = JSON.parse(tags);
  const newPost = new Post({
    title,
    description,
    image: req.file.path,
    tags: parsedTags,
  });

  try {
    const savedPost = await newPost.save();

    
      
    req.io.emit('newNotif', { message: "New post created!" }); 
      console.log('New post notification sent on backend');
    

    res.status(200).json(savedPost);
  } catch (err) {
    console.error('Error creating post:', err);  // Log the error for better debugging
    res.status(500).json(err);
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json('Post deleted successfully');
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
