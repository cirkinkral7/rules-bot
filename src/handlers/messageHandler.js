/**
 * Mesaj event'lerini işler
 * Gelen mesajları kurallara göre kontrol eder ve yanıt verir
 */

const logger = require('../utils/logger');
const matcher = require('../utils/matcher');
const cooldown = require('../utils/cooldown');
const rulesStore = require('../storage/rulesStore');

/**
 * Mesaj oluşturulduğunda çalışır
 */
async function handleMessage(message) {
  // Bot mesajlarını ve DM'leri atla
  if (message.author.bot || !message.guild) return;

  try {
    // Aktif kuralları al
    const rules = rulesStore.getActiveRules();
    if (rules.length === 0) return;

    // Eşleşen kuralları bul
    const matchedRules = matcher.findMatchingRules(message, rules);

    if (matchedRules.length === 0) return;

    // İlk eşleşen kuralı kullan (öncelik sırasına göre)
    const rule = matchedRules[0];

    // Cooldown kontrolü
    if (cooldown.isOnCooldown(message.author.id, rule.id)) {
      logger.debug(`Cooldown aktif: ${message.author.tag} için kural #${rule.id}`);
      return;
    }

    // Yanıt gönder
    await message.reply(rule.reply);

    // Cooldown başlat
    cooldown.setCooldown(message.author.id, rule.id);

    // Kullanım sayısını artır
    await rulesStore.incrementUsage(rule.id);

    logger.info(
      `Kural tetiklendi: #${rule.id} | Kullanıcı: ${message.author.tag} | ` +
      `Kanal: ${message.channel.name}`
    );

  } catch (error) {
    logger.error('Mesaj işlenirken hata:', error);

    // Hata durumunda kullanıcıya bilgi verme (opsiyonel)
    // await message.reply('❌ Bir hata oluştu, lütfen daha sonra tekrar deneyin.');
  }
}

module.exports = { handleMessage };
