const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'backend/.env') });

const port = Number(process.env.PORT) || 4000;
const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
const dbFile = process.env.DB_FILE || path.resolve(__dirname, '..', 'data', 'daily-log.db');
const managerSecret = process.env.MANAGER_CREDS_SECRET || 'manager-secret-key';

module.exports = { port, jwtSecret, dbFile, managerSecret };
