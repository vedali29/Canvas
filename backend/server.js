const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const canvasRoutes = require('./routes/canvasRoutes');

const app = express();
require('dotenv').config();
console.log(process.env.MONGO_URI); 


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/canvas', canvasRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


console.log(process.env.MONGO_URI)
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI ;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});