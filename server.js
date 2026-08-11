require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const billsRouter = require('./routes/bills');
const clientsRouter = require('./routes/clients');
const settingsRouter = require('./routes/settings');

app.use('/api/bills', billsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/settings', settingsRouter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});
