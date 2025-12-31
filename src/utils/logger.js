/**
 * Basit loglama utility'si
 * Renkli konsol çıktıları sağlar
 */

const config = require('../config');

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const colors = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m'
};

const currentLevel = levels[config.logLevel] || levels.info;

/**
 * Formatlı log mesajı basar
 */
function log(level, message, data = null) {
  if (levels[level] < currentLevel) return;

  const timestamp = new Date().toISOString();
  const color = colors[level];
  const reset = colors.reset;

  console.log(
    `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`
  );

  if (data) {
    console.log(data);
  }
}

module.exports = {
  debug: (msg, data) => log('debug', msg, data),
  info: (msg, data) => log('info', msg, data),
  warn: (msg, data) => log('warn', msg, data),
  error: (msg, data) => log('error', msg, data)
};
