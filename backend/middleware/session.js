const session = require('express-session');
const sessionStore = require('../session/store');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret-change-in-production';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'sid';
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '3600000', 10); // 1 hour
const IS_PROD = process.env.NODE_ENV === 'production';

let redisStoreInstance = null;

async function getSessionMiddleware() {
  if (!redisStoreInstance) {
    // Initialize the Redis session store if not already done
    redisStoreInstance = await sessionStore.initialize();
  }

  return session({
    store: redisStoreInstance,
    name: SESSION_COOKIE_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: () => uuidv4(),
    cookie: {
      httpOnly: true,
      secure: IS_PROD, // Only send cookie over HTTPS in production
      sameSite: IS_PROD ? 'strict' : 'lax',
      maxAge: SESSION_TIMEOUT,
      path: '/',
    },
    unset: 'destroy'
  });
}

module.exports = getSessionMiddleware; 