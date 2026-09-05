/* ==========================================================================
   API — dual-mode top-up API
   --------------------------------------------------------------------------
   sandbox:  Bepul, to'liq ishlaydigan simulyatsiya. Buyurtma hayot sikli:
             queued → processing → done (kamdan-kam hollarda failed).
   live:     Real top-up provayderiga momaqaldiroq tezlikda ulanish.
             CONFIG.TOPUP_API_BASE + TOPUP_API_KEY + TOPUP_API_PATHS ishlatiladi.
   ========================================================================== */
"use strict";

const API = (() => {

  const MODE = (CONFIG.TOPUP_MODE || "sandbox") === "live" && CONFIG.TOPUP_API_BASE ? "live" : "sandbox";

  const internalOrders = new Map(); // localStorage bilan sinxron, xuddi real DB

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function fail(msg, code) { return { ok: false, error: msg, code }; }

  /* ---------------- LIVE rejim: real HTTP qatlami ---------------- */

  async function http(method, path, body) {
    const url = CONFIG.TOPUP_API_BASE.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (CONFIG.TOPUP_API_KEY) headers["Authorization"] = "Bearer " + CONFIG.TOPUP_API_KEY;

    let res;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10000)
      });
    } catch (e) {
      return fail("Serverga ulanishda xatolik: " + e.message);
    }

    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) return fail((data && (data.message || data.error)) || "HTTP " + res.status + " xatosi", res.status);
    return { ok: true, data };
  }

  /* ---------------- sandbox simulyator ---------------- */

  async function simPing() {
    await delay(300 + Math.random() * 200);
    return { ok: true, service: "GameDonat API", mode: MODE, version: "2.0.0", time: Date.now() };
  }

  async function simCreateOrder({ gameId, packId, userId, uid }) {
    await delay(500 + Math.random() * 500);
    const game = findGameById(gameId);
    const pack = game && game.packs.find(p => p.id === packId);
    if (!game || !pack) return fail("Noma'lum buyurtma");
    const order = {
      id: "GD" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      game: game.name,
      amount: pack.amount,
      price: pack.price,
      coins: pack.coins,
      userId,
      uid,
      status: "queued",
      createdAt: Date.now()
    };
    internalOrders.set(order.id, order);
    const orderRef = { ...order };
    setTimeout(() => {
      const o = internalOrders.get(orderRef.id);
      if (o && o.status === "queued") { o.status = "processing"; internalOrders.set(orderRef.id, o); }
    }, 3000 + Math.random() * 2000);
    setTimeout(() => {
      const o = internalOrders.get(orderRef.id);
      if (o && o.status === "processing") {
        o.status = Math.random() < 0.985 ? "done" : "failed";
        o.finishedAt = Date.now();
        internalOrders.set(orderRef.id, o);
      }
    }, 7000 + Math.random() * 5000);
    return { ok: true, order };
  }

  async function simOrderStatus(orderId) {
    await delay(250);
    const o = internalOrders.get(orderId);
    if (!o) return fail("Buyurtma topilmadi");
    return { ok: true, status: o.status, finishedAt: o.finishedAt };
  }

  async function simValidatePromo(code) {
    await delay(400 + Math.random() * 300);
    const key = String(code || "").trim().toUpperCase();
    const promo = PROMO_DATA[key];
    if (!promo) return fail("Promokod topilmadi yoki muddati tugagan");
    return { ok: true, code: key, ...promo };
  }

  /* ---------------- Umumiy kirish nuqtalari ---------------- */

  async function ping() {
    if (MODE === "live") {
      const r = await http("GET", "/health");
      return r.ok ? { ok: true, service: "GameDonat Live API", mode: MODE, ...r.data } : r;
    }
    return simPing();
  }

  async function getGames() {
    if (MODE === "live") {
      const r = await http("GET", CONFIG.TOPUP_API_PATHS.catalog);
      return r.ok ? { ok: true, games: r.data } : r;
    }
    await delay(250 + Math.random() * 250);
    return { ok: true, games: GAME_DATA.games.map(g => ({
      id: g.id, name: g.name, icon: g.icon, art: g.art, img: g.img,
      type: g.type, unit: g.unit, colors: g.colors,
      minPrice: Math.min(...g.packs.map(p => p.price))
    })) };
  }

  async function getPacks(gameId) {
    const game = findGameById(gameId);
    if (!game) return fail("O'yin topilmadi");
    await delay(150 + Math.random() * 250);
    return { ok: true, packs: game.packs };
  }

  async function createOrder(payload) {
    if (MODE === "live") {
      const p = findGameById(payload.gameId);
      const pk = p && p.packs.find(x => x.id === payload.packId);
      if (!p || !pk) return fail("Noma'lum paket");
      const r = await http("POST", CONFIG.TOPUP_API_PATHS.order, {
        productId: pk.id, gameId: payload.gameId, uid: payload.uid, quantity: 1
      });
      if (!r.ok) return r;
      return { ok: true, order: r.data };
    }
    return simCreateOrder(payload);
  }

  async function getOrderStatus(orderId) {
    if (MODE === "live") {
      const r = await http("GET", CONFIG.TOPUP_API_PATHS.status.replace("{id}", encodeURIComponent(orderId)));
      return r.ok ? { ok: true, status: r.data.status, finishedAt: r.data.finishedAt } : r;
    }
    return simOrderStatus(orderId);
  }

  async function validatePromo(code) {
    if (MODE === "live") {
      const r = await http("POST", "/promo", { code: String(code || "").toUpperCase() });
      return r.ok ? { ok: true, code: r.data.code, type: r.data.type, reward: r.data.reward, label: r.data.label } : r;
    }
    return simValidatePromo(code);
  }

  return {
    MODE,
    ping, getGames, getPacks,
    createOrder, getOrderStatus,
    validatePromo
  };
})();