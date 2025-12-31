/**
 * Kullanıcı cooldown yönetimi
 * Aynı kullanıcının aynı kuralı spam etmesini engeller
 */

const config = require('../config');
const logger = require('./logger');

// Kullanıcı cooldown'larını tutan Map
// Yapı: Map<userId-ruleId, timestamp>
const cooldowns = new Map();

/**
 * Kullanıcının bu kural için cooldown'da olup olmadığını kontrol eder
 */
function isOnCooldown(userId, ruleId) {
  const key = `${userId}-${ruleId}`;
  const lastUsed = cooldowns.get(key);

  if (!lastUsed) return false;

  const now = Date.now();
  const cooldownTime = config.defaultCooldown * 1000; // Saniyeden milisaniyeye

  const timeLeft = cooldownTime - (now - lastUsed);

  if (timeLeft > 0) {
    logger.debug(`Cooldown aktif: ${userId} için ${ruleId} (${Math.ceil(timeLeft / 1000)}s kaldı)`);
    return true;
  }

  // Cooldown süresi dolmuş, temizle
  cooldowns.delete(key);
  return false;
}

/**
 * Kullanıcı için cooldown başlatır
 */
function setCooldown(userId, ruleId) {
  const key = `${userId}-${ruleId}`;
  cooldowns.set(key, Date.now());

  logger.debug(`Cooldown set edildi: ${userId} için ${ruleId}`);
}

/**
 * Belirli bir kullanıcı veya kural için cooldown'ı temizler
 */
function clearCooldown(userId, ruleId = null) {
  if (ruleId) {
    const key = `${userId}-${ruleId}`;
    cooldowns.delete(key);
  } else {
    // Kullanıcının tüm cooldown'larını temizle
    for (const key of cooldowns.keys()) {
      if (key.startsWith(`${userId}-`)) {
        cooldowns.delete(key);
      }
    }
  }
}

/**
 * Eski cooldown'ları temizle (1 saatte bir çalıştırılabilir)
 */
function cleanup() {
  const now = Date.now();
  const cooldownTime = config.defaultCooldown * 1000;
  let cleaned = 0;

  for (const [key, timestamp] of cooldowns.entries()) {
    if (now - timestamp > cooldownTime) {
      cooldowns.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug(`${cleaned} adet eski cooldown temizlendi`);
  }
}

// Her 1 saatte bir otomatik temizlik
setInterval(cleanup, 60 * 60 * 1000);

module.exports = {
  isOnCooldown,
  setCooldown,
  clearCooldown,
  cleanup
};
