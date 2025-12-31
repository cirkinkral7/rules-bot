/**
 * Kural depolama ve yönetimi
 * JSON dosyasına okuma/yazma işlemleri
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const validators = require('../utils/validators');

// Bellekteki kural listesi
let rulesCache = {
  rules: [],
  nextId: 1
};

const rulesPath = path.resolve(config.rulesFile);

/**
 * Kuralları dosyadan yükler
 */
async function loadRules() {
  try {
    const data = await fs.readFile(rulesPath, 'utf8');
    rulesCache = JSON.parse(data);
    logger.info(`${rulesCache.rules.length} kural yüklendi`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Dosya yoksa yeni oluştur
      logger.info('rules.json bulunamadı, yeni dosya oluşturuluyor');
      await saveRules();
      return true;
    }
    logger.error('Kurallar yüklenirken hata:', error);
    return false;
  }
}

/**
 * Kuralları dosyaya kaydeder
 */
async function saveRules() {
  try {
    const data = JSON.stringify(rulesCache, null, 2);
    await fs.writeFile(rulesPath, data, 'utf8');
    logger.debug('Kurallar kaydedildi');
    return true;
  } catch (error) {
    logger.error('Kurallar kaydedilirken hata:', error);
    return false;
  }
}

/**
 * Tüm kuralları getirir
 */
function getAllRules() {
  return [...rulesCache.rules];
}

/**
 * Aktif kuralları getirir
 */
function getActiveRules() {
  return rulesCache.rules.filter(rule => rule.enabled);
}

/**
 * ID'ye göre kural getirir
 */
function getRuleById(id) {
  return rulesCache.rules.find(rule => rule.id === id);
}

/**
 * Yeni kural ekler
 */
async function addRule(pattern, type, reply, createdBy) {
  // Kural limiti kontrolü
  if (rulesCache.rules.length >= config.maxRules) {
    return {
      success: false,
      error: `Maksimum kural sayısına ulaşıldı (${config.maxRules})`
    };
  }

  // Validasyon
  const validation = validators.validateRule({ pattern, type, reply });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Yeni kural oluştur
  const newRule = {
    id: rulesCache.nextId++,
    pattern,
    type,
    reply,
    enabled: true,
    createdBy,
    createdAt: new Date().toISOString(),
    usageCount: 0
  };

  rulesCache.rules.push(newRule);
  await saveRules();

  logger.info(`Yeni kural eklendi: #${newRule.id} (${type}) by ${createdBy}`);

  return { success: true, rule: newRule };
}

/**
 * Kural siler
 */
async function removeRule(id) {
  const index = rulesCache.rules.findIndex(rule => rule.id === id);

  if (index === -1) {
    return { success: false, error: 'Kural bulunamadı' };
  }

  const removed = rulesCache.rules.splice(index, 1)[0];
  await saveRules();

  logger.info(`Kural silindi: #${id}`);

  return { success: true, rule: removed };
}

/**
 * Kuralı açar/kapatır
 */
async function toggleRule(id) {
  const rule = getRuleById(id);

  if (!rule) {
    return { success: false, error: 'Kural bulunamadı' };
  }

  rule.enabled = !rule.enabled;
  await saveRules();

  logger.info(`Kural ${rule.enabled ? 'açıldı' : 'kapatıldı'}: #${id}`);

  return { success: true, rule, enabled: rule.enabled };
}

/**
 * Kuralın kullanım sayısını artırır
 */
async function incrementUsage(id) {
  const rule = getRuleById(id);

  if (rule) {
    rule.usageCount = (rule.usageCount || 0) + 1;
    // Her kullanımda kaydetmek yerine periyodik kaydetme yapılabilir
    // Performans için bu kaydı atlayabilirsiniz
    await saveRules();
  }
}

/**
 * Kuralları günceller (toplu)
 */
async function updateRules(newRules) {
  rulesCache.rules = newRules;
  await saveRules();
}

/**
 * Tüm kuralları siler (dikkatli kullanın!)
 */
async function clearAllRules() {
  rulesCache.rules = [];
  await saveRules();
  logger.warn('TÜM KURALLAR SİLİNDİ!');
  return { success: true };
}

/**
 * İstatistikler getirir
 */
function getStats() {
  const total = rulesCache.rules.length;
  const active = rulesCache.rules.filter(r => r.enabled).length;
  const totalUsage = rulesCache.rules.reduce((sum, r) => sum + (r.usageCount || 0), 0);

  return {
    total,
    active,
    inactive: total - active,
    totalUsage
  };
}

module.exports = {
  loadRules,
  saveRules,
  getAllRules,
  getActiveRules,
  getRuleById,
  addRule,
  removeRule,
  toggleRule,
  incrementUsage,
  updateRules,
  clearAllRules,
  getStats
};
