/**
 * Uygulama konfigürasyonu
 * Ortam değişkenlerini yükler ve doğrular
 */

require('dotenv').config();

const config = {
  // Discord credentials
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  // Bot ayarları
  logLevel: process.env.LOG_LEVEL || 'info',
  defaultCooldown: parseInt(process.env.DEFAULT_COOLDOWN) || 5,

  // Kural limitleri
  maxRules: 100,
  maxPatternLength: 500,
  maxReplyLength: 2000,

  // Dosya yolları
  rulesFile: './src/storage/rules.json'
};

/**
 * Gerekli ortam değişkenlerini kontrol eder
 */
function validateConfig() {
  const required = ['token', 'clientId'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Eksik ortam değişkenleri: ${missing.join(', ')}\n` +
      '.env dosyanızı kontrol edin!'
    );
  }
}

validateConfig();

module.exports = config;
