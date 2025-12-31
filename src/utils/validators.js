/**
 * Girdi doğrulama fonksiyonları
 */

const config = require('../config');
const logger = require('./logger');

/**
 * Pattern'i doğrular
 */
function validatePattern(pattern, type) {
  if (!pattern || typeof pattern !== 'string') {
    return { valid: false, error: 'Pattern bir string olmalı' };
  }

  if (pattern.length > config.maxPatternLength) {
    return {
      valid: false,
      error: `Pattern en fazla ${config.maxPatternLength} karakter olabilir`
    };
  }

  // Regex tipinde regex geçerliliğini kontrol et
  if (type === 'regex') {
    try {
      new RegExp(pattern);
    } catch (e) {
      return {
        valid: false,
        error: `Geçersiz regex pattern: ${e.message}`
      };
    }
  }

  return { valid: true };
}

/**
 * Reply'ı doğrular
 */
function validateReply(reply) {
  if (!reply || typeof reply !== 'string') {
    return { valid: false, error: 'Reply bir string olmalı' };
  }

  if (reply.length > config.maxReplyLength) {
    return {
      valid: false,
      error: `Reply en fazla ${config.maxReplyLength} karakter olabilir`
    };
  }

  return { valid: true };
}

/**
 * Eşleşme tipini doğrular
 */
function validateType(type) {
  const validTypes = ['equals', 'contains', 'startsWith', 'regex'];

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      error: `Geçersiz tip. Geçerli tipler: ${validTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Kural ID'sini doğrular
 */
function validateRuleId(id) {
  const numId = parseInt(id);

  if (isNaN(numId) || numId < 1) {
    return { valid: false, error: 'Geçersiz kural ID\'si' };
  }

  return { valid: true, id: numId };
}

/**
 * Tam kural nesnesini doğrular
 */
function validateRule(rule) {
  const patternCheck = validatePattern(rule.pattern, rule.type);
  if (!patternCheck.valid) return patternCheck;

  const replyCheck = validateReply(rule.reply);
  if (!replyCheck.valid) return replyCheck;

  const typeCheck = validateType(rule.type);
  if (!typeCheck.valid) return typeCheck;

  return { valid: true };
}

module.exports = {
  validatePattern,
  validateReply,
  validateType,
  validateRuleId,
  validateRule
};
