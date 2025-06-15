const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Check for required env variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ========== Middlewares ==========
app.use(cors());
app.use(express.json());

// ========== API Routes ==========
const noteRoutes = require('./routes/notes');
app.use('/api/notes', noteRoutes);

const labelRoutes = require('./routes/labels');
app.use('/api/labels', labelRoutes);

const reminderRoutes = require('./routes/reminders');  // 🔔 Add reminder routes
app.use('/api/reminders', reminderRoutes);             // 🔔 Mount reminders

// ========== DB Connection & Server ==========
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
