const runSeeders = require('../database/seeders');

const env = process.env.NODE_ENV || 'development';
runSeeders(env); 