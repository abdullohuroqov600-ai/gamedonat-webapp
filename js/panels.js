/* ==========================================================================
   PANELS — rendering logic for every section
   ========================================================================== */
"use strict";

const Panels = (() => {

  const els = {
    headerBalance: () => document.getElementById("headerBalance"),
    gamesGrid: () => document.getElementById("gamesGrid"),
    homeGames: () => document.getElementById("homeGames"),
    quickGrid: () => document.getElementById("quickGrid"),
    quickStats: () => document.getElementById("quickStats"),
    servicesList: () => document.getElementById("servicesList"),
    gameDetail: () => document.getElementById("gameDetail"),
    promoList: () => document.getElementById("promoList"),
    profileAvatar: () => document.getElementById("profileAvatar"),
    profileName: () => document.getElementById("profileName"),
    profileId: () => document.getElementById("profileId"),
    profileStats: () => document.getElementById("profileStats"),
    profileHistory: () => document.getElementById("profileHistory"),
    profileChart: () => document.getElementById("profileChart"),
    faqList: () => document.getElementById("faqList")
  };

  let currentGameId = null;
  let selectedPackId = null;

  /* ---------------- HOME ---------------- */
  function renderQuickStats() {
    const s = Store.get();
    const totalSpent = s.history.filter(h => h.direction !== "in").reduce((a, h) => a + h.amount, 0);
    const orders = s.history.length;
    const container = els.quickStats();
    container.innerHTML = `
      <div class="stat-item" data-goto="games">
        <div class="st-val">${UI.fmtMoney(s.balance)}</div><div class="st-lab">Balans</div>
      </div>
      <div class="stat-item" data-goto="profile">
        <div class="st-val">${orders}</div><div class="st-lab">Buyurtmalar</div>
      </div>
      <div class="stat-item" data-goto="services">
        <div class="st-val">${UI.fmtMoney(totalSpent)}</div><div class="st-lab">Sarflangan</div>
      </div>
    `;
    container.querySelectorAll("[data-goto]").forEach(el => {
      el.addEventListener("click", () => App.goTo(el.dataset.goto));
    });
  }

  function renderQuickGrid() {
    const quick = SERVICE_DATA.services.slice(0, 4);
    const container = els.quickGrid();
    container.innerHTML = quick.map(s => `
      <div class="service-item" data-service="${s.id}">
        <div class="sv-ico">${s.icon}</div>
        <div class="sv-info">
          <div class="sv-name">${s.name}</div>
          <div class="sv-price">${s.price} ball</div>
        </div>
      </div>
    `).join("") + `
      <div class="service-item home-extra" data-goto="services">
        <div class="sv-ico">➡️</div>
        <div class="sv-info"><div class="sv-name">Barcha xizmatlar</div><div class="sv-desc">To'liq katalogni ko'rish</div></div>
      </div>`;
    container.querySelectorAll("[data-service]").forEach(el =>
      el.addEventListener("click", () => confirmService(el.dataset.service)));
    container.querySelectorAll("[data-goto]").forEach(el =>
      el.addEventListener("click", () => App.goTo(el.dataset.goto)));
  }

  function renderHomeGames() {
    const container = els.homeGames();
    container.innerHTML = GAME_DATA.games.slice(0, 4).map(g => gameCardHtml(g)).join("");
    bindGameCards(container);
    loadGameImages(container);
  }

  /* ---------------- GAMES ---------------- */
  function renderGames(filter = "") {
    const f = filter.trim().toLowerCase();
    const list = GAME_DATA.games.filter(g =>
      !f || g.name.toLowerCase().includes(f) || g.search.includes(f));
    const container = els.gamesGrid();
    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><div class="es-ico">🎮</div>Hech narsa topilmadi</div>`;
      return;
    }
    container.innerHTML = list.map(g => gameCardHtml(g)).join("");
    bindGameCards(container);
    loadGameImages(container);
  }

  function gameCardHtml(g) {
    return `
      <div class="game-card" data-game="${g.id}" style="--gc1:${g.colors[0]};--gc2:${g.colors[1]}">
        <div class="gc-visual">${gameImgHtml(g)}</div>
        <div class="gc-body">
          <div class="gc-name">${g.name}</div>
          <div class="gc-type">${g.type}</div>
          <div class="gc-ro">
            <span class="gc-price">🪙 ${g.packs ? Math.min(...g.packs.map(p => p.price)) : 0}+</span>
            <button class="btn btn-primary btn-sm gc-btn">Donat</button>
          </div>
        </div>
      </div>`;
  }

  function bindGameCards(container) {
    container.querySelectorAll(".game-card").forEach(card => {
      card.addEventListener("click", () => openGame(card.dataset.game));
    });
    container.querySelectorAll(".game-card .gc-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openGame(btn.closest(".game-card").dataset.game);
      });
    });
  }

  function openGame(gameId) {
    const game = findGameById(gameId);
    if (!game) return;
    currentGameId = gameId;
    selectedPackId = null;
    App.showPanel("game-detail");
    renderGameDetail(game);
  }

  function renderGameDetail(game) {
    const s = Store.get();
    const container = els.gameDetail();
    container.innerHTML = `
      <div class="gd-banner" style="--gc1:${game.colors[0]};--gc2:${game.colors[1]}">
        <div class="gd-banner-img">${gameImgHtml(game)}</div>
        <div class="gd-banner-name">${game.name}</div>
        <div class="gd-banner-sub">${game.type} • ${game.unit}</div>
      </div>
      <div class="section-title">Paketlar</div>
      <div class="packs-list">${game.packs.map(p => packCardHtml(p, s.discountPct)).join("")}</div>
      <input type="text" class="input uid-input" id="gdUid" placeholder="O'yin ID / UID kiriting" inputmode="numeric" />
      <div class="gd-total" id="gdTotal">
        <span class="lbl">Jami to'lov</span>
        <span class="amt">0 ball</span>
      </div>
      <button class="btn btn-success btn-block btn-lg" id="gdBuyBtn">🛒 Xarid Qilish</button>
    `;
    container.querySelectorAll(".pack-card").forEach(pc => {
      pc.addEventListener("click", () => selectPack(pc.dataset.pack));
    });
    document.getElementById("gdBuyBtn").addEventListener("click", doGamePurchase);
    loadGameImages(container);
  }

  /* Game visual: real image if available, otherwise a themed art banner */
  function gameImgHtml(game) {
    return `<div class="gimg" data-src="${game.img}" data-art="${game.art}" data-style="--gc1:${game.colors[0]};--gc2:${game.colors[1]}"><span class="gimg-art">${game.art}</span></div>`;
  }

  /* Try to load a real image for each .gimg; keep art fallback if it fails */
  function loadGameImages(scope = document) {
    scope.querySelectorAll(".gimg").forEach(el => {
      if (el.classList.contains("has-img")) return;
      el.setAttribute("style", el.dataset.style || "");
      const img = new Image();
      img.onload = () => {
        el.classList.add("has-img");
        el.innerHTML = "";
        el.appendChild(img);
        el.classList.add("loaded");
      };
      img.onerror = () => { el.classList.add("img-miss"); };
      img.src = el.dataset.src;
    });
  }

  function packCardHtml(p, discountPct) {
    const price = discountPct > 0 ? Math.round(p.price * (1 - discountPct / 100)) : p.price;
    return `
      <div class="pack-card" data-pack="${p.id}">
        ${p.bonus ? `<span class="pk-tag">${p.bonus}</span>` : ""}
        <div class="pk-amount">${p.amount}</div>
        <div class="pk-bonus">${p.bonus || "&nbsp;"}</div>
        <div class="pk-price">${price} ball</div>
      </div>`;
  }

  function selectPack(packId) {
    selectedPackId = packId;
    const container = els.gameDetail();
    container.querySelectorAll(".pack-card").forEach(pc => pc.classList.toggle("selected", pc.dataset.pack === packId));
    updateTotal(container);
  }

  function updateTotal(container) {
    const game = findGameById(currentGameId);
    const pack = game && game.packs.find(p => p.id === selectedPackId);
    const s = Store.get();
    const price = pack && s.discountPct > 0 ? Math.round(pack.price * (1 - s.discountPct / 100)) : (pack ? pack.price : 0);
    const amt = container.querySelector("#gdTotal .amt");
    if (amt) amt.textContent = price + " ball";
  }

  async function doGamePurchase() {
    const game = findGameById(currentGameId);
    const pack = game && game.packs.find(p => p.id === selectedPackId);
    if (!pack) { UI.toast("Avval paket tanlang", "warn"); return; }

    const uidEl = els.gameDetail().querySelector("#gdUid");
    const uid = uidEl ? uidEl.value.trim() : "";
    if (!uid) { UI.toast("O'yin ID kiriting", "warn"); return; }

    const s = Store.get();
    const price = s.discountPct > 0 ? Math.round(pack.price * (1 - s.discountPct / 100)) : pack.price;
    if (s.balance < price) {
      UI.openModal({
        icon: "💸", title: "Balans yetarli emas",
        desc: `Xarid uchun ${price - s.balance} ball yetmayapti. Balansingiz: ${s.balance} ball.`,
        actions: [
          { id: "topup", label: "Balans to'ldirish", cls: "btn-success", onClick: () => topUpBalance() },
          { id: "skip", label: "Bekor qilish", cls: "btn-ghost" }
        ]
      });
      return;
    }

    UI.toast("Buyurtma yuborilmoqda...", "info");
    const res = await API.createOrder({ gameId: game.id, packId: pack.id, userId: s.tgId || "anon", uid });
    if (!res.ok) { UI.toast(res.error, "error"); return; }

    // apply discount now (one-time on purchase already applied above; discount kept)
    Store.setBalance(s.balance - price);
    Store.addHistory({
      title: `${game.name} • ${pack.amount}`,
      sub: `ID: ${uid}`,
      orderId: res.order.id,
      status: res.order.status || "queued",
      amount: -price,
      icon: game.icon,
      type: "game"
    });
    updateBalanceUI();
    renderProfile();

    UI.openModal({
      icon: "🎉", title: "Donat muvaffaqiyatli!",
      desc: `${game.name} • ${pack.amount}<br>Buyurtma raqami: <b>${res.order.id}</b><br>${pack.amount} yetkazilmoqda. Statusni <b>Kabinet → Xaridlar</b> bo'limida kuzating.`,
      actions: [
        { id: "ok", label: "OK", cls: "btn-success" }
      ]
    });
  }

  function topUpBalance() {
    if (CONFIG && CONFIG.PAYMENT_LINK) {
      window.open(CONFIG.PAYMENT_LINK, "_blank");
      UI.toast("To'lov sahifasi ochilmoqda...", "info");
    } else {
      App.goTo("support");
      UI.toast("Admin bilan bog'lanib balans to'ldirasiz", "info");
    }
  }

  /* ---------------- SERVICES ---------------- */
  function renderServices(filter = "") {
    const f = filter.trim().toLowerCase();
    const list = SERVICE_DATA.services.filter(s =>
      !f || s.name.toLowerCase().includes(f) || s.desc.toLowerCase().includes(f));
    const container = els.servicesList();
    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><div class="es-ico">🛠️</div>Xizmat topilmadi</div>`;
      return;
    }
    container.innerHTML = list.map(s => `
      <div class="service-item" data-service="${s.id}">
        <div class="sv-ico">${s.icon}</div>
        <div class="sv-info">
          <div class="sv-name">${s.name} ${s.tag ? `<span class="pk-tag" style="position:static;display:inline-block;margin-left:4px">${s.tag}</span>` : ""}</div>
          <div class="sv-desc">${s.desc}</div>
        </div>
        <div class="sv-price">${s.price} ball</div>
        <div class="sv-arrow">›</div>
      </div>`).join("");
    container.querySelectorAll("[data-service]").forEach(el =>
      el.addEventListener("click", () => confirmService(el.dataset.service)));
  }

  function confirmService(serviceId) {
    const svc = findServiceById(serviceId);
    if (!svc) return;
    const s = Store.get();
    const price = s.discountPct > 0 ? Math.round(svc.price * (1 - s.discountPct / 100)) : svc.price;
    UI.openModal({
      icon: svc.icon, title: svc.name,
      desc: `${svc.desc}<br><br>Narxi: <b>${price} ball</b><br>Hisobingizda: ${s.balance} ball`,
      actions: [
        { id: "buy", label: "Xarid qilish", cls: "btn-success", onClick: () => doServicePurchase(svc, price) },
        { id: "cancel", label: "Bekor qilish", cls: "btn-ghost" }
      ]
    });
  }

  async function doServicePurchase(svc, price) {
    const s = Store.get();
    if (s.balance < price) {
      UI.toast("Balans yetarli emas", "error");
      return;
    }
    UI.toast("Xizmat sotib olinmoqda...", "info");
    const res = await API.buyService(svc.id);
    if (!res.ok) { UI.toast(res.error, "error"); return; }
    Store.setBalance(s.balance - price);
    Store.addHistory({
      title: svc.name, sub: res.order.id,
      orderId: res.order.id,
      status: res.order.status || "processing",
      amount: -price, icon: svc.icon, type: "service"
    });
    updateBalanceUI();
    renderProfile();
    UI.openModal({
      icon: "✅", title: "Xizmat faollashtirildi!",
      desc: `${svc.name}<br>Buyurtma: <b>${res.order.id}</b>`,
      actions: [{ id: "ok", label: "OK", cls: "btn-success" }]
    });
  }

  /* ---------------- PROMO ---------------- */
  function renderPromoList() {
    const s = Store.get();
    const container = els.promoList();
    container.innerHTML = Object.entries(PROMO_DATA).map(([code, p]) => {
      const claimed = s.claimedPromos.indexOf(code) !== -1;
      return `
        <div class="promo-item ${claimed ? "claimed" : ""}" data-code="${code}">
          <span class="pi-code">${code}</span>
          <span class="pi-reward">${claimed ? "✓ Ishlatilgan" : p.label}</span>
          <span class="pi-arrow">›</span>
        </div>`;
    }).join("");
    container.querySelectorAll(".promo-item:not(.claimed)").forEach(el =>
      el.addEventListener("click", () => {
        document.getElementById("promoInput").value = el.dataset.code;
        applyPromo(el.dataset.code);
      }));
  }

  async function applyPromo(code) {
    const s = Store.get();
    const input = document.getElementById("promoInput");
    code = (code || input.value || "").trim().toUpperCase();
    const resultEl = document.getElementById("promoResult");

    if (!code) { UI.toast("Promokod kiriting", "warn"); return; }
    if (s.claimedPromos.indexOf(code) !== -1) {
      resultEl.innerHTML = `<div class="result-err">Bu promokod allaqachon ishlatilgan</div>`;
      return;
    }
    input.value = code;
    resultEl.innerHTML = `<div style="color:var(--text-3)">Tekshirilmoqda...</div>`;
    const res = await API.validatePromo(code);
    if (!res.ok) {
      resultEl.innerHTML = `<div class="result-err">${res.error}</div>`;
      return;
    }
    Store.markPromoClaimed(code);
    let msg;
    if (res.type === "balance") {
      Store.addBalance(res.reward);
      msg = `🎉 Tabriklaymiz! +${res.reward} ball hisobingizga qo'shildi.`;
    } else {
      Store.setDiscount(res.reward);
      msg = `🎉 ${res.reward}% chegirma olgansiz! Donat va xizmatlarda qo'llaniladi.`;
    }
    resultEl.innerHTML = `<div class="result-ok">${msg}</div>`;
    updateBalanceUI();
    renderProfile();
    renderPromoList();
    UI.toast("Promokod faollashtirildi!", "success");
  }

  /* ---------------- PROFILE ---------------- */
  function renderProfile() {
    const s = Store.get();
    const avatar = els.profileAvatar();
    if (s.photo) {
      avatar.innerHTML = `<img src="${s.photo}" alt="avatar" onerror="this.style.display='none'">`;
    } else {
      avatar.textContent = "👤";
    }
    els.profileName().textContent = s.userName;
    els.profileId().textContent = s.tgId || "—";

    const totalSpent = s.history.filter(h => h.direction !== "in").reduce((a, h) => a + h.amount, 0);
    els.profileStats().innerHTML = `
      <div class="stat-item"><div class="st-val">${UI.fmtMoney(s.balance)}</div><div class="st-lab">Balans</div></div>
      <div class="stat-item"><div class="st-val">${s.history.length}</div><div class="st-lab">Xaridlar</div></div>
      <div class="stat-item"><div class="st-val">${UI.fmtMoney(Math.abs(totalSpent))}</div><div class="st-lab">Jami</div></div>
    `;
    renderHistory();
    renderStatsChart();
  }

  function renderHistory() {
    const s = Store.get();
    const container = els.profileHistory();
    if (!s.history.length) {
      container.innerHTML = `<div class="empty-state"><div class="es-ico">🗂️</div>Hali xaridlar yo'q</div>`;
      return;
    }
    container.innerHTML = s.history.map(h => `
      <div class="history-item">
        <div class="h-ico">${h.icon || "📦"}</div>
        <div class="h-info">
          <div class="h-title">${h.title}</div>
          <div class="h-time">${h.sub || ""} ${h.orderId ? "• " + h.orderId : ""}</div>
          <span class="order-status" data-order="${h.orderId || ""}">${statusBadge(h.status)}</span>
          <div class="h-time">${UI.timeAgo(h.at)}</div>
        </div>
        <div class="h-amount ${h.amount > 0 ? "pos" : "neg"}">${h.amount > 0 ? "+" : ""}${h.amount}</div>
      </div>`).join("");
    pollOrderStatuses(container);
  }

  const STATUS_META = {
    queued:     { icon: "⏳", label: "Navbatda", cls: "st-queued" },
    processing: { icon: "⚙️", label: "Bajarilmoqda", cls: "st-processing" },
    done:       { icon: "✅", label: "Bajarildi", cls: "st-done" },
    failed:     { icon: "❌", label: "Muvaffaqiyatsiz", cls: "st-failed" }
  };

  function statusBadge(status) {
    const m = STATUS_META[status] || STATUS_META.queued;
    return `<span class="badge ${m.cls}">${m.icon} ${m.label}</span>`;
  }

  const finishedOrders = new Set();

  /* Buyurtma statuslarini real vaqtda tekshirish (polling) */
  function pollOrderStatuses(scope) {
    scope.querySelectorAll("[data-order]").forEach(badge => {
      const orderId = badge.dataset.order;
      if (!orderId || finishedOrders.has(orderId)) return;
      API.getOrderStatus(orderId).then(res => {
        if (!res || !res.ok) return;
        badge.innerHTML = statusBadge(res.status);
        if (res.status === "done" || res.status === "failed") {
          finishedOrders.add(orderId);
          if (document.visibilityState === "visible") {
            UI.toast(`${res.status === "done" ? "✅" : "❌"} Buyurtma ${orderId} ${res.status === "done" ? "bajarildi" : "muvaffaqiyatsiz"}`,
              res.status === "done" ? "success" : "error");
          }
        }
      }).catch(() => {});
    });
  }

  function renderStatsChart() {
    const s = Store.get();
    const container = els.profileChart();
    const counts = {};
    s.history.forEach(h => { if (h.type) counts[h.type] = (counts[h.type] || 0) + 1; });
    const labels = { game: { ico: "🎮", name: "O'yin donatlari" }, service: { ico: "🛠️", name: "Xizmatlar" }, promo: { ico: "🎁", name: "Bonuslar" } };
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const rows = Object.entries(counts).map(([k, v]) => {
      const meta = labels[k] || { ico: "📦", name: k };
      const pct = Math.round((v / total) * 100);
      return `
        <div class="svc-row">
          <div class="svc-top"><span>${meta.ico} ${meta.name}</span><span>${v} ta • ${pct}%</span></div>
          <div class="svc-bar"><div class="svc-fill" style="width:${pct}%"></div></div>
        </div>`;
    }).join("");
    container.innerHTML = rows || `<div class="empty-state">Statistika uchun xaridlar kerak</div>`;
  }

  function toggleProfileTab(tab) {
    document.querySelectorAll(".mini-tab").forEach(t => t.classList.toggle("active", t.dataset.mtab === tab));
    if (tab === "history") {
      els.profileHistory().classList.remove("hidden");
      els.profileChart().classList.add("hidden");
    } else {
      els.profileHistory().classList.add("hidden");
      els.profileChart().classList.remove("hidden");
    }
  }

  /* ---------------- SUPPORT ---------------- */
  function renderFaq() {
    const container = els.faqList();
    container.innerHTML = FAQ_DATA.map((f, i) => `
      <div class="faq-item" data-i="${i}">
        <button class="faq-q">${f.q} <span class="fa">▾</span></button>
        <div class="faq-a">${f.a}</div>
      </div>`).join("");
    container.querySelectorAll(".faq-item").forEach(item => {
      item.querySelector(".faq-q").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        container.querySelectorAll(".faq-item.open").forEach(o => o.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  function updateBalanceUI() {
    els.headerBalance().textContent = UI.fmtMoney(Store.get().balance);
  }

  return {
    renderQuickStats, renderQuickGrid, renderHomeGames,
    renderGames, openGame, renderServices, renderPromoList,
    renderProfile, toggleProfileTab, renderFaq,
    updateBalanceUI, selectPack, applyPromo, loadGameImages
  };
})();
