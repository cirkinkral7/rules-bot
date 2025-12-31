/**
 * /rule slash komutu
 * Alt komutlar: add, remove, list, toggle
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rulesStore = require('../storage/rulesStore');
const validators = require('../utils/validators');
const logger = require('../utils/logger');

// Komut tanımı
const data = new SlashCommandBuilder()
  .setName('rule')
  .setDescription('Kural yönetimi')
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Yeni kural ekle')
      .addStringOption(option =>
        option
          .setName('pattern')
          .setDescription('Mesajda aranacak kalıp')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('type')
          .setDescription('Eşleşme tipi')
          .setRequired(true)
          .addChoices(
            { name: 'Tam Eşleşme (equals)', value: 'equals' },
            { name: 'İçerir (contains)', value: 'contains' },
            { name: 'Başlar (startsWith)', value: 'startsWith' },
            { name: 'Regex', value: 'regex' }
          )
      )
      .addStringOption(option =>
        option
          .setName('reply')
          .setDescription('Gönderilecek yanıt')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('remove')
      .setDescription('Kural sil')
      .addIntegerOption(option =>
        option
          .setName('id')
          .setDescription('Silinecek kuralın ID\'si')
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('Tüm kuralları listele')
      .addIntegerOption(option =>
        option
          .setName('page')
          .setDescription('Sayfa numarası (her sayfa 10 kural)')
          .setMinValue(1)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('toggle')
      .setDescription('Kuralı aç/kapat')
      .addIntegerOption(option =>
        option
          .setName('id')
          .setDescription('Açılıp/kapatılacak kuralın ID\'si')
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('stats')
      .setDescription('Kural istatistiklerini göster')
  );

/**
 * Komutu çalıştırır
 */
async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'add':
      await handleAdd(interaction);
      break;
    case 'remove':
      await handleRemove(interaction);
      break;
    case 'list':
      await handleList(interaction);
      break;
    case 'toggle':
      await handleToggle(interaction);
      break;
    case 'stats':
      await handleStats(interaction);
      break;
    default:
      await interaction.reply({
        content: '❌ Bilinmeyen alt komut!',
        ephemeral: true
      });
  }
}

/**
 * /rule add - Yeni kural ekler
 */
async function handleAdd(interaction) {
  const pattern = interaction.options.getString('pattern');
  const type = interaction.options.getString('type');
  const reply = interaction.options.getString('reply');

  const result = await rulesStore.addRule(
    pattern,
    type,
    reply,
    interaction.user.tag
  );

  if (!result.success) {
    await interaction.reply({
      content: `❌ Kural eklenemedi: ${result.error}`,
      ephemeral: true
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('✅ Kural Eklendi')
    .addFields(
      { name: 'ID', value: `#${result.rule.id}`, inline: true },
      { name: 'Tip', value: type, inline: true },
      { name: 'Durum', value: '🟢 Aktif', inline: true },
      { name: 'Pattern', value: `\`${pattern}\`` },
      { name: 'Yanıt', value: reply }
    )
    .setFooter({ text: `Oluşturan: ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 * /rule remove - Kural siler
 */
async function handleRemove(interaction) {
  const id = interaction.options.getInteger('id');

  const result = await rulesStore.removeRule(id);

  if (!result.success) {
    await interaction.reply({
      content: `❌ Kural silinemedi: ${result.error}`,
      ephemeral: true
    });
    return;
  }

  await interaction.reply({
    content: `✅ Kural #${id} başarıyla silindi!`,
    ephemeral: true
  });
}

/**
 * /rule list - Kuralları listeler
 */
async function handleList(interaction) {
  const rules = rulesStore.getAllRules();
  const page = interaction.options.getInteger('page') || 1;
  const perPage = 10;

  if (rules.length === 0) {
    await interaction.reply({
      content: '📝 Henüz hiç kural eklenmemiş.',
      ephemeral: true
    });
    return;
  }

  const totalPages = Math.ceil(rules.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageRules = rules.slice(startIndex, endIndex);

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('📋 Kural Listesi')
    .setDescription(`Toplam ${rules.length} kural (Sayfa ${page}/${totalPages})`);

  pageRules.forEach(rule => {
    const status = rule.enabled ? '🟢' : '🔴';
    const usage = rule.usageCount || 0;

    embed.addFields({
      name: `${status} #${rule.id} - ${rule.type}`,
      value:
        `**Pattern:** \`${rule.pattern}\`\n` +
        `**Yanıt:** ${rule.reply.substring(0, 50)}${rule.reply.length > 50 ? '...' : ''}\n` +
        `**Kullanım:** ${usage} kez`,
      inline: false
    });
  });

  embed.setFooter({ text: `Sayfa ${page}/${totalPages}` });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * /rule toggle - Kuralı açar/kapatır
 */
async function handleToggle(interaction) {
  const id = interaction.options.getInteger('id');

  const result = await rulesStore.toggleRule(id);

  if (!result.success) {
    await interaction.reply({
      content: `❌ Kural bulunamadı: #${id}`,
      ephemeral: true
    });
    return;
  }

  const status = result.enabled ? '🟢 Açıldı' : '🔴 Kapatıldı';

  await interaction.reply({
    content: `${status} - Kural #${id}`,
    ephemeral: true
  });
}

/**
 * /rule stats - İstatistikleri gösterir
 */
async function handleStats(interaction) {
  const stats = rulesStore.getStats();

  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle('📊 Kural İstatistikleri')
    .addFields(
      { name: 'Toplam Kural', value: stats.total.toString(), inline: true },
      { name: '🟢 Aktif', value: stats.active.toString(), inline: true },
      { name: '🔴 Pasif', value: stats.inactive.toString(), inline: true },
      { name: 'Toplam Kullanım', value: stats.totalUsage.toString(), inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { data, execute };
