/* ==========================================================================
   API — mock/free API endpoints
   Each method simulates a network request with a small delay and returns
   a Promise. Swap the bodies with real fetch() calls to go live.
   ========================================================================== */
"use strict";

const API = (() => {

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* Simulated ping to check API status */
  async function ping() {
    await delay(350);
    return { ok: true, service: "GameDonat API", version: "1.0.0", time: Date.now() };
  }

  /* Fetch game catalog (mock) */
  async function getGames() {
    await delay(400);
    return { ok: true, games: GAME_DATA.games.map(g => ({
      id: g.id, name: g.name, icon: g.icon, type: g.type, unit: g.unit,
      minPrice: Math.min(...g.packs.map(p => p.price)),
      colors: g.colors
    })) };
  }

  /* Fetch packs for a given game */
  async function getPacks(gameId) {
    await delay(300);
    const game = findGameById(gameId);
    if (!game) return { ok: false, error: "O'yin topilmadi" };
    return { ok: true, packs: game.packs };
  }

  /* Create a top-up order (mock) */
  async function createOrder({ gameId, packId, userId, uid }) {
    await delay(800);
    const game = findGameById(gameId);
    const pack = game && game.packs.find(p => p.id === packId);
    if (!game || !pack) return { ok: false, error: "Noma'lum buyurtma" };

    const orderId = "GD" + Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      ok: true,
      order: {
        id: orderId,
        game: game.name,
        amount: pack.amount,
        price: pack.price,
        coins: pack.coins,
        userId,
        uid,
        status: "queued",
        createdAt: Date.now()
      }
    };
  }

  /* Buy a telegram service (mock) */
  async function buyService(serviceId) {
    await delay(700);
    const svc = findServiceById(serviceId);
    if (!svc) return { ok: false, error: "Xizmat topilmadi" };
    const orderId = "TS" + Math.random().toString(36).slice(2, 8).toUpperCase();
    return { ok: true, order: { id: orderId, service: svc.name, price: svc.price, status: "processing", createdAt: Date.now() } };
  }

  /* Validate promo code (mock) */
  async function validatePromo(code) {
    await delay(600);
    const key = String(code || "").trim().toUpperCase();
    const promo = PROMO_DATA[key];
    if (!promo) return { ok: false, error: "Promokod topilmadi yoki muddati tugagan" };
    return { ok: true, code: key, ...promo };
  }

  return {
    ping,
    getGames,
    getPacks,
    createOrder,
    buyService,
    validatePromo
  };
})();
