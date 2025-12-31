/**
 * Discord bot'u kurar ve event'leri bağlar
 */

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const config = require('./config');
const logger = require('./utils/logger');
const rulesStore = require('./storage/rulesStore');
const messageHandler = require('./handlers/messageHandler');
const interactionHandler = require('./handlers/interactionHandler');

// Komutları kaydet
const ruleCommand = require('./commands/rule');
interactionHandler.registerCommand('rule', ruleCommand);

/**
 * Discord client'ı oluşturur
 */
function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  return client;
}

/**
 * Event handler'ları bağlar
 */
function setupEventHandlers(client) {
  
  // Bot hazır olduğunda
  client.once('ready', async () => {
    logger.info(`✅ Bot giriş yaptı: ${client.user.tag}`);
    logger.info(`📊 ${client.guilds.cache.size} sunucuda aktif`);

    // Kuralları yükle
    const loaded = await rulesStore.loadRules();
    if (!loaded) {
      logger.error('⚠️ Kurallar yüklenemedi, bot başlatılıyor ama kurallar çalışmayabilir');
    }

    // Bot durumunu ayarla
    const stats = rulesStore.getStats();
    client.user.setActivity(`${stats.active} aktif kural`, {
      type: ActivityType.Watching
    });

    logger.info('🚀 Bot hazır!');
  });

  // Mesaj oluşturulduğunda
  client.on('messageCreate', async (message) => {
    await messageHandler.handleMessage(message);
  });

  // Slash komut kullanıldığında
  client.on('interactionCreate', async (interaction) => {
    await interactionHandler.handleInteraction(interaction);
  });

  // Hata yönetimi
  client.on('error', (error) => {
    logger.error('Discord client hatası:', error);
  });

  client.on('warn', (warning) => {
    logger.warn('Discord client uyarısı:', warning);
  });

  // Process hataları
  process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Bot kapatılıyor...');
    await rulesStore.saveRules();
    client.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Bot kapatılıyor (SIGTERM)...');
    await rulesStore.saveRules();
    client.destroy();
    process.exit(0);
  });
}

/**
 * Bot'u başlatır
 */
async function startBot() {
  const client = createClient();
  
  setupEventHandlers(client);

  try {
    await client.login(config.token);
  } catch (error) {
    logger.error('Bot giriş yapamadı:', error);
    process.exit(1);
  }

  return client;
}

module.exports = {
  createClient,
  setupEventHandlers,
  startBot
};
