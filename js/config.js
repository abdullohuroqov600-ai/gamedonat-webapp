/* ==========================================================================
   CONFIG — asosiy sozlamalar
   Bu fayl orqali real (live) top-up provayderiga ulanishingiz mumkin.
   ========================================================================== */
"use strict";

const CONFIG = {
  APP_NAME: "GameDonat",
  ADMIN_USERNAME: "GameDonat_Admin",   // ← Yordam tugmasi shu username'ga yo'naladi

  /*
   * TOPUP_MODE:
   *   "sandbox" — bepul simulyatsiya rejimi (hech narsa sozlamasdan ishlaydi).
   *               Buyurtma: queued → processing → done bosqichlaridan o'tadi.
   *   "live"    — real savdo API'si. Quyidagilarni to'ldiring:
   */
  TOPUP_MODE: "sandbox",

  // Real provayder sozlamalari (live rejimi uchun)
  TOPUP_API_BASE: "https://api.myserver.com/api/v1",  // provayder bazasi
  TOPUP_API_KEY: "",                                   // API kalit (demo/test — bepul)
  TOPUP_API_PATHS: {                                   // provayder endpoint'lari
    catalog: "/catalog",
    price:   "/price",        // { gameId, productId }
    order:   "/order",        // POST { productId, uid, quantity }
    status:  "/order/{id}"    // GET
  },

  // Balans to'ldirish: agar havola qo'ysangiz modal'dagi tugma shunga boradi,
  // bo'lmasa foydalanuvchiga "Admin bilan bog'laning" deyiladi.
  PAYMENT_LINK: "",

  // Order statuslarini tekshirish intervali (ms)
  POLL_INTERVAL: 3500
};