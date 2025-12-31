/**
 * Slash komutlarını Discord'a kaydeder
 * Bu dosyayı komut değişikliklerinden sonra çalıştırın: npm run deploy
 */

const { REST, Routes } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');

// Komut dosyalarını import et
const ruleCommand = require('./rule');

const commands = [
  ruleCommand.data.toJSON()
  // Buraya yeni komutlar eklenebilir
];

const rest = new REST({ version: '10' }).setToken(config.token);

/**
 * Komutları Discord'a deploy eder
 */
async function deployCommands() {
  try {
    logger.info(`${commands.length} komut kaydediliyor...`);

    let data;

    if (config.guildId) {
      // Belirli bir sunucuya deploy (test için hızlı)
      logger.info(`Sunucuya deploy ediliyor: ${config.guildId}`);
      
      data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
    } else {
      // Global deploy (tüm sunuculara, 1 saat sürebilir)
      logger.info('Global olarak deploy ediliyor (1 saat sürebilir)...');
      
      data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
    }

    logger.info(`✅ ${data.length} komut başarıyla kaydedildi!`);
    
    // Kayıtlı komutları listele
    data.forEach(cmd => {
      logger.info(`  - /${cmd.name}`);
    });

  } catch (error) {
    logger.error('Komutlar deploy edilirken hata:', error);
    process.exit(1);
  }
}

/**
 * Tüm komutları siler (temizlik için)
 */
async function deleteAllCommands() {
  try {
    logger.warn('TÜM KOMUTLAR SİLİNİYOR...');

    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: [] }
      );
      logger.info('✅ Sunucu komutları silindi');
    } else {
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: [] }
      );
      logger.info('✅ Global komutlar silindi');
    }

  } catch (error) {
    logger.error('Komutlar silinirken hata:', error);
  }
}

// Komut satırı argümanlarını kontrol et
const args = process.argv.slice(2);

if (args.includes('--delete')) {
  deleteAllCommands();
} else {
  deployCommands();
}

module.exports = { deployCommands, deleteAllCommands };
