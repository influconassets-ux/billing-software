require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:5173', 'https://riddhiman-billing-software.netlify.app'];
app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const billsRouter = require('./routes/bills');
const clientsRouter = require('./routes/clients');
const settingsRouter = require('./routes/settings');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRouter);
app.use('/api/bills', authMiddleware, billsRouter);
app.use('/api/clients', authMiddleware, clientsRouter);
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
