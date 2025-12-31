/**
 * Mesaj-pattern eşleşme mantığı
 */

const logger = require('./logger');

/**
 * Mesajın pattern'e uyup uymadığını kontrol eder
 */
function matchMessage(message, pattern, type) {
  const content = message.toLowerCase();
  const pat = pattern.toLowerCase();

  try {
    switch (type) {
      case 'equals':
        return content === pat;

      case 'contains':
        return content.includes(pat);

      case 'startsWith':
        return content.startsWith(pat);

      case 'regex':
        const regex = new RegExp(pattern, 'i'); // Case-insensitive
        return regex.test(message);

      default:
        logger.warn(`Bilinmeyen eşleşme tipi: ${type}`);
        return false;
    }
  } catch (error) {
    logger.error(`Eşleşme hatası (${type}):`, error);
    return false;
  }
}

/**
 * Mesajı tüm kurallara göre kontrol eder ve eşleşenleri döndürür
 */
function findMatchingRules(message, rules) {
  const content = message.content;

  return rules.filter(rule => {
    // Kural kapalıysa atla
    if (!rule.enabled) return false;

    return matchMessage(content, rule.pattern, rule.type);
  });
}

module.exports = {
  matchMessage,
  findMatchingRules
};
