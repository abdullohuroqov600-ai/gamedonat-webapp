/* ==========================================================================
   DATA — static catalog: games, services, promos, FAQ
   ========================================================================== */
"use strict";

const GAME_DATA = {
  games: [
    { id: "pubg", name: "PUBG Mobile", icon: "🪖", art: "🪂", img: "assets/img/pubg.png", type: "UC / BP / Levels",
      colors: ["#f59e0b", "#ef4444"], unit: "UC", search: "pubg mobile player unknown battlegrounds uc",
      packs: [
        { id: "u60", amount: "60 UC", coins: 60, price: 12 },
        { id: "u325", amount: "325 UC", coins: 325, price: 55, bonus: "+12 UC" },
        { id: "u660", amount: "660 UC", coins: 660, price: 99, bonus: "+20 UC" },
        { id: "u1800", amount: "1800 UC", coins: 1800, price: 269, bonus: "+36 UC" },
        { id: "u3850", amount: "3850 UC", coins: 3850, price: 549, bonus: "+100 UC" },
        { id: "u8100", amount: "8100 UC", coins: 8100, price: 1099, bonus: "+228 UC" }
      ] },
    { id: "ff", name: "Free Fire", icon: "🔥", art: "💥", img: "assets/img/ff.png", type: "Diamonds / Gold",
      colors: ["#ef4444", "#f59e0b"], unit: "Dia", search: "free fire diamonds gold dimal",
      packs: [
        { id: "d55", amount: "55 💎", coins: 55, price: 8 },
        { id: "d110", amount: "110 💎", coins: 110, price: 15 },
        { id: "d310", amount: "310 💎", coins: 310, price: 39, bonus: "+12 💎" },
        { id: "d530", amount: "530 💎", coins: 530, price: 65, bonus: "+26 💎" },
        { id: "d1060", amount: "1060 💎", coins: 1060, price: 129, bonus: "+58 💎" }
      ] },
    { id: "ml", name: "Mobile Legends", icon: "⚔️", art: "🗡️", img: "assets/img/ml.png", type: "Diamonds",
      colors: ["#3b82f6", "#a855f7"], unit: "Dia", search: "mobile legends bang bang diamond mcl",
      packs: [
        { id: "m20", amount: "20 🔷", coins: 20, price: 4 },
        { id: "m50", amount: "50 🔷", coins: 50, price: 8 },
        { id: "m100", amount: "100 🔷", coins: 100, price: 15 },
        { id: "m300", amount: "300 🔷", coins: 300, price: 42, bonus: "+15 🔷" }
      ] },
    { id: "coc", name: "Clash of Clans", icon: "🏰", art: "👑", img: "assets/img/coc.png", type: "Gems",
      colors: ["#22d3ee", "#3b82f6"], unit: "Gem", search: "clash of clans gem cristal",
      packs: [
        { id: "g80", amount: "80 💠", coins: 80, price: 9 },
        { id: "g500", amount: "500 💠", coins: 500, price: 49 },
        { id: "g1200", amount: "1200 💠", coins: 1200, price: 99, bonus: "+140 💠" }
      ] },
    { id: "fifa", name: "EA FC / FIFA", icon: "⚽", art: "🏆", img: "assets/img/fifa.png", type: "FP / Coins",
      colors: ["#22c55e", "#16a34a"], unit: "FP", search: "fifa ea fc football points coins",
      packs: [
        { id: "fp200", amount: "200 FP", coins: 200, price: 19 },
        { id: "fp500", amount: "500 FP", coins: 500, price: 45 },
        { id: "fp1500", amount: "1500 FP", coins: 1500, price: 129 }
      ] },
    { id: "cod", name: "COD Mobile", icon: "🔫", art: "🎯", img: "assets/img/cod.png", type: "CP",
      colors: ["#a855f7", "#ec4899"], unit: "CP", search: "call of duty mobile cp points",
      packs: [
        { id: "c80", amount: "80 CP", coins: 80, price: 8 },
        { id: "c420", amount: "420 CP", coins: 420, price: 39 },
        { id: "c880", amount: "880 CP", coins: 880, price: 79 }
      ] },
    { id: "gta", name: "GTA V / Online", icon: "🚗", art: "💰", img: "assets/img/gta.png", type: "Shark Cards",
      colors: ["#f59e0b", "#ef4444"], unit: "Shark", search: "gta v online shark card money",
      packs: [
        { id: "t500", amount: "$500K", coins: 500, price: 8 },
        { id: "t1m", amount: "$1M", coins: 1000, price: 15 },
        { id: "t10m", amount: "$10M", coins: 10000, price: 129 }
      ] },
    { id: "mlbb2", name: "Roblox", icon: "🧱", art: "🚀", img: "assets/img/roblox.png", type: "Robux",
      colors: ["#ec4899", "#a855f7"], unit: "Robux", search: "roblox robux rbx",
      packs: [
        { id: "r80", amount: "80 Robux", coins: 80, price: 7 },
        { id: "r400", amount: "400 Robux", coins: 400, price: 33 },
        { id: "r800", amount: "800 Robux", coins: 800, price: 65 }
      ] }
  ]
};

const SERVICE_DATA = {
  services: [
    { id: "tg-premium", name: "Telegram Premium", icon: "⭐", desc: "Oyiga Premium obuna", price: 12, tag: "HOT" },
    { id: "tg-stars", name: "Telegram Stars", icon: "✨", desc: "Stars ballari (50 dona)", price: 8, tag: "NEW" },
    { id: "tg-plus", name: "Telegram Plus", icon: "📱", desc: "Telegram Plus modifikasiya", price: 5 },
    { id: "nick", name: "Ism (Nick) o'zgartirish", icon: "✏️", desc: "Telegram nickni o'zgartirish", price: 3 },
    { id: "bio", name: "Bio / Rasm sozlash", icon: "🖼️", desc: "Profil jozibasini oshirish", price: 2 },
    { id: "group", name: "Guruh yaratish", icon: "👥", desc: "Guruh va kanal yaratish", price: 6 },
    { id: "verify", name: "Verification (✓)", icon: "✅", desc: "Premium nac belgisi", price: 19, tag: "VIP" },
    { id: "member", name: "Member yig'ish", icon: "📈", desc: "Kanalga obunachilar", price: 10 }
  ]
};

const PROMO_DATA = {
  "GAME10": { type: "balance", reward: 10, label: "10 ball bonus" },
  "START50": { type: "balance", reward: 50, label: "50 ball bonus" },
  "WELCOME25": { type: "balance", reward: 25, label: "25 ball bonus" },
  "VIP20": { type: "discount", reward: 20, label: "20% chegirma" },
  "BONUS100": { type: "balance", reward: 100, label: "100 ball bonus" }
};

const FAQ_DATA = [
  { q: "Donat qancha vaqtda yetkaziladi?", a: "Avtomatik xizmatlar 1–5 daqiqada, qo'lda xizmatlar 10–30 daqiqada bajariladi. Barcha buyurtmalar navbat bo'yicha." },
  { q: "To'lov qanday amalga oshiriladi?", a: "To'lov balans orqali amalga oshiriladi. Balansni bot orqali yoki yordam bo'limidagi adminga murojaat qilib to'ldirishingiz mumkin." },
  { q: "Buyurtma kelmasa nima qilish kerak?", a: "ID to'g'ri kiritilganini tekshiring. Muammo bo'lsa, Yordam bo'limidagi admin bilan bog'laning, 10–15 daqiqada hal qilinadi." },
  { q: "Promokodni qayerdan olaman?", a: "Promokodlar kanal va guruhlarda e'lon qilinadi. Yaxshiroq kodlar uchun Premium obunachilarga maxsus takliflar beriladi." }
];

function findGameById(id) {
  return (GAME_DATA.games || []).find(g => g.id === id);
}
function findServiceById(id) {
  return (SERVICE_DATA.services || []).find(s => s.id === id);
}
