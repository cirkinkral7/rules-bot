/**
 * Slash komut (interaction) event'lerini işler
 */

const logger = require('../utils/logger');

// Komut dosyaları
const commands = new Map();

/**
 * Komut dosyasını yükler
 */
function registerCommand(name, commandModule) {
  commands.set(name, commandModule);
  logger.debug(`Komut kaydedildi: ${name}`);
}

/**
 * Interaction oluşturulduğunda çalışır
 */
async function handleInteraction(interaction) {
  // Sadece slash komutları işle
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Bilinmeyen komut: ${interaction.commandName}`);
    return;
  }

  try {
    logger.info(
      `Komut çalıştırılıyor: /${interaction.commandName} | ` +
      `Kullanıcı: ${interaction.user.tag} | ` +
      `Sunucu: ${interaction.guild?.name || 'DM'}`
    );

    await command.execute(interaction);

  } catch (error) {
    logger.error(`Komut hatası (${interaction.commandName}):`, error);

    const errorMessage = '❌ Komut çalıştırılırken bir hata oluştu!';

    // Henüz yanıt verilmediyse
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: errorMessage,
        ephemeral: true
      });
    } else {
      // Zaten yanıt verildiyse follow-up gönder
      await interaction.followUp({
        content: errorMessage,
        ephemeral: true
      });
    }
  }
}

module.exports = {
  registerCommand,
  handleInteraction
};
