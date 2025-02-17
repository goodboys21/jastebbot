require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);
const OWNER_ID = process.env.OWNER_ID;
const configPath = './config.json';

// Load data premium user
let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const saveConfig = () => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

// Cek apakah user premium
const isPremium = (userId) => config.premium_users.includes(userId);

// Perintah /start
bot.start((ctx) => {
  ctx.reply("🤖 Selamat datang di Bot Jasteb!\nGunakan /jasteb <email> <waktu> untuk menambahkan email.");
});

// Perintah /addprem (Khusus Owner)
bot.command('addprem', (ctx) => {
  if (ctx.from.id.toString() !== OWNER_ID) return ctx.reply("❌ Kamu bukan owner!");

  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("⚠️ Gunakan format: /addprem <user_id>");

  let userId = args[1];
  if (!config.premium_users.includes(userId)) {
    config.premium_users.push(userId);
    saveConfig();
    ctx.reply(`✅ User ${userId} telah ditambahkan ke premium.`);
  } else {
    ctx.reply("⚠️ User sudah premium.");
  }
});

// Perintah /delprem (Khusus Owner)
bot.command('delprem', (ctx) => {
  if (ctx.from.id.toString() !== OWNER_ID) return ctx.reply("❌ Kamu bukan owner!");

  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("⚠️ Gunakan format: /delprem <user_id>");

  let userId = args[1];
  config.premium_users = config.premium_users.filter(id => id !== userId);
  saveConfig();
  ctx.reply(`✅ User ${userId} telah dihapus dari premium.`);
});

// Perintah /jasteb (Tambah Email)
bot.command('jasteb', async (ctx) => {
  if (!isPremium(ctx.from.id.toString())) return ctx.reply("❌ Kamu bukan user premium!");

  let args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("⚠️ Gunakan format: /jasteb <email> <waktu>");

  let email = args[1];
  let waktu = args[2];

  try {
    let response = await axios.post("https://panelbananaezz.qzcmy.web.id/user/67b1ecc85934e/v4/mak.php", {
      email: email,
      waktu: waktu
    });

    if (response.data.success) {
      ctx.reply(`✅ Email berhasil ditambahkan:\n📧 ${email}\n⏳ Waktu: ${waktu} menit`);
    } else {
      ctx.reply("❌ Gagal menambahkan email.");
    }
  } catch (error) {
    ctx.reply("⚠️ Terjadi kesalahan saat menghubungi server.");
  }
});

// Perintah /list (Daftar Email)
bot.command('list', async (ctx) => {
  if (!isPremium(ctx.from.id.toString())) return ctx.reply("❌ Kamu bukan user premium!");

  try {
    let response = await axios.get("https://panelbananaezz.qzcmy.web.id/user/67b1ecc85934e/v4/mak.php");
    let data = response.data.emails;

    if (data.length === 0) {
      ctx.reply("📭 Tidak ada email terdaftar.");
    } else {
      let list = "📜 *Daftar Email Terdaftar:*\n";
      data.forEach((item, index) => {
        list += `${index + 1}. 📧 ${item.email}\n⏳ ${item.waktu} menit\n📅 ${item.timestamp}\n\n`;
      });
      ctx.reply(list, { parse_mode: "Markdown" });
    }
  } catch (error) {
    ctx.reply("⚠️ Gagal mengambil daftar email.");
  }
});

// Jalankan bot
bot.launch().then(() => {
  console.log("✅ Bot Jasteb berjalan...");
});
