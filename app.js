require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

// Ensure upload directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
connectDB().then(() => {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(methodOverride('_method'));

  // Session configuration with updated MongoStore
  app.use(session({
    secret: process.env.JWT_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60, // Session TTL (14 days)
      autoRemove: 'native' // Clean up expired sessions
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));

  // Static files
  app.use(express.static('public'));
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

  // Template engine setup
  app.use(expressLayout);
  app.set('layout', './layouts/main');
  app.set('view engine', 'ejs');

  // Local variables
  app.locals.isActiveRoute = isActiveRoute;

  // Routes
  app.use('/', require('./server/routes/main'));
  app.use('/', require('./server/routes/admin'));

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to MongoDB:', error);
});