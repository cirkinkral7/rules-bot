/**
 * Uygulama giriş noktası
 * Bot'u başlatır
 */

const logger = require('./utils/logger');
const { startBot } = require('./bot');

// ASCII art banner (opsiyonel)
console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║        KALIP BOT v1.0.0              ║
║   Pattern-Based Auto-Reply Bot       ║
║                                       ║
╚═══════════════════════════════════════╝
`);

/**
 * Ana fonksiyon
 */
async function main() {
  try {
    logger.info('Bot başlatılıyor...');
    
    const client = await startBot();
    
    // Bot başarıyla başlatıldı
    logger.info('Bot başarıyla başlatıldı ve çalışıyor');

  } catch (error) {
    logger.error('Bot başlatılamadı:', error);
    process.exit(1);
  }
}

// Uygulamayı başlat
main();
