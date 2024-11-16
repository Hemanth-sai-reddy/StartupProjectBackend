const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const auth = require('../middleware/auth');

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('creatorId', 'name');
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create a new event with file upload
router.post('/create', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, externalLink } = req.body;
    const image = req.file ? req.file.path : null;

    const newEvent = new Event({
      title,
      description,
      image,
      externalLink,
      creatorId: req.user.id,
    });

    await newEvent.save();
    res.status(201).json({ msg: 'Event created successfully', newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Delete an event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.creatorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await event.deleteOne();
    res.status(200).json({ msg: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
