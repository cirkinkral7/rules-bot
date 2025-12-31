# Kalıp Bot

Discord sunucunuzda belirli kalıplara uyan mesajlara otomatik yanıt veren bot.

## Özellikler

- ✅ Slash komutlarla kural yönetimi (`/rule`)
- ✅ 4 farklı eşleşme türü: `equals`, `contains`, `startsWith`, `regex`
- ✅ Kullanıcı bazlı cooldown (spam önleme)
- ✅ Kuralları açma/kapama
- ✅ JSON tabanlı kalıcı depolama

## Kurulum

### 1. Gereksinimler

- Node.js v16.9.0 veya üstü
- Bir Discord bot hesabı ([Discord Developer Portal](https://discord.com/developers/applications))

### 2. Projeyi Klonlayın

```bash
git clone <repo-url>
cd kalip-bot
npm install
```
### 3. Bot Token ve ID’leri Alın
	1.	Discord Developer Portal’a gidin
	2.	“New Application” → Bot adı verin
	3.	“Bot” sekmesi → “Reset Token” → Token’ı kopyalayın
	4.	“OAuth2” → “General” → Application ID’yi kopyalayın
	5.	Sunucunuzun ID’sini alın (Discord’da Developer Mode’u açıp sunucuya sağ tık → Copy ID)

### 4. .env Dosyasını Düzenleyin

```bash 
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_guild_id_here
```

### 5. Slash Komutları Deploy Edin

```bash
npm run deploy
```

### 6. Botu Başlatın

```bash
npm start
```

# Kullanım

## Slash Komutlar

### Kural Ekleme

```bash
/rule add pattern:selam type:contains reply:Aleyküm selam!
```

### Kursl Liste

```bash
/rule list
```

### Kural Silme

```bash
/rule remove id:1
```
### Kural Açma Kapama

```bash
/rule toggle id:1
```
