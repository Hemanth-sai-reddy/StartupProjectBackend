const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const postRoutes = require('./routes/posts'); // Import post routes
const communityRoutes = require('./routes/community');
const eventRoutes = require('./routes/event');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "https://startup-project-frontend.vercel.app/", // Frontend URL
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
  }
});

// Attach io to every request in middleware
app.use((req, res, next) => {
  req.io = io;  // Attach io to the request object
  next();
});

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/posts', postRoutes);  // Routes without passing io explicitly
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
