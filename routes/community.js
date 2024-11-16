const express = require('express');
const Community = require('../models/Community'); // Assuming you have this model
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


router.delete('/:id', auth, async (req, res) => {
  try {
    const communityId = req.params.id;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }

    // Ensure only the creator can delete the community
    if (community.creatorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this community' });
    }

    // Use findByIdAndDelete() instead of remove()
    await Community.findByIdAndDelete(communityId);
    res.json({ msg: 'Community deleted successfully' });
  } catch (err) {
    console.error(err); // Print the error for debugging
    res.status(500).send('Server error');
  }
});

// Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creatorId', 'username')
      .populate('members', 'name');  // Populating members with 'name'
      
    res.json(communities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a new community
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.path : '';  // Store the image path

  try {
    const newCommunity = new Community({
      title,
      description,
      image,
      creatorId: req.user.id,
      members: [req.user.id],
    });

    await newCommunity.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    console.error('Error creating community:', err.message);
    res.status(500).send('Server error');
  }
});

// Join a community
router.post('/join/:id', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ msg: 'Community not found' });

    // Check if the user is already a member
    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member' });
    }

    community.members.push(req.user.id);
    await community.save();

    res.json(community);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
