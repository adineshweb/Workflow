const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');


const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const { getMyRequests } = require('./controllers/requestController');
const { protect } = require('./middleware/auth');

const app = express();


app.use(express.json());


app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(xss());

app.use(helmet());

app.use(
  cors({
    origin: 'http://localhost:5173', 
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes',
});
app.use('/api', limiter);


app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

app.get('/api/my-requests', protect, getMyRequests);

app.get('/', (req, res) => {
  res.json({ message: 'Role-Based Approval & Workflow API is running' });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'API Endpoint not found',
  });
});

app.use(errorHandler);

module.exports = app;
