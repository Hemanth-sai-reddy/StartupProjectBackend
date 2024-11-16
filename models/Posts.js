const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL of the image
    required: true,
  },
  tags: {
    type: [String],  // This ensures tags are stored as an array of strings
  },
  comments: {
    type: [String],
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
