/* ==========================================================================
   APP — boot, Telegram WebApp init, navigation, event wiring
   ========================================================================== */
"use strict";

const App = (() => {

  let tg = null;

  /* ---------- Telegram WebApp init ---------- */
  function initTelegram() {
    try {
      tg = window.Telegram && window.Telegram.WebApp;
      if (!tg) {
        console.warn("Telegram WebApp SDK topilmadi — browser mode");
        document.body.dataset.tg = "browser";
        return;
      }
      tg.ready();
      tg.expand();
      tg.setHeaderColor && tg.setHeaderColor("#07070f");
      tg.setBackgroundColor && tg.setBackgroundColor("#07070f");
      tg.disableVerticalSwipes && tg.disableVerticalSwipes();

      // User data
      const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (u) {
        Store.setUser({
          firstName: u.first_name,
          username: u.username,
          id: u.id,
          photo: u.photo_url
        });
      }
      // Bind theme
      if (tg.colorScheme === "light") {
        document.documentElement.dataset.theme = "light";
      }
      applyTgTheme();
      if (tg.onEvent) {
        tg.onEvent("themeChanged", applyTgTheme);
        tg.onEvent("mainButtonClicked", () => tg.HapticFeedback && tg.HapticFeedback.impactOccurred("medium"));
      }
    } catch (e) {
      console.error("TG init error:", e);
      document.body.dataset.tg = "browser";
    }
    document.body.setAttribute("data-tg-supported", tg ? "yes" : "no");
  }

  function applyTgTheme() {
    if (!tg) return;
    const te = tg.themeParams || {};
    const root = document.documentElement.style;
    if (te.bg_color) root.setProperty("--tg-bg", te.bg_color);
    if (te.text_color) root.setProperty("--tg-text", te.text_color);
    if (te.button_color) root.setProperty("--tg-btn", te.button_color);
    if (te.hint_color) root.setProperty("--tg-hint", te.hint_color);
    if (te.subtitle_text_color) root.setProperty("--tg-subtext", te.subtitle_text_color);
  }

  /* ---------- Navigation ---------- */
  const tabMap = ["home", "games", "services", "promo", "profile", "support", "game-detail"];

  function showPanel(name) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    const panel = document.getElementById("panel-" + name);
    if (panel) panel.classList.add("active");
  }

  function setActiveTab(tab) {
    // top tabs
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    // bottom nav
    document.querySelectorAll(".b-nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  }

  function goTo(tab) {
    if (tab === "game-detail") { showPanel("game-detail"); setActiveTab("games"); return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
    showPanel(tab);
    setActiveTab(tab);
    switch (tab) {
      case "home":
        Panels.renderQuickStats();
        Panels.renderQuickGrid();
        Panels.renderHomeGames();
        break;
      case "games":
        document.getElementById("gameSearch").value = "";
        Panels.renderGames();
        break;
      case "services":
        document.getElementById("serviceSearch").value = "";
        Panels.renderServices();
        break;
      case "promo":
        document.getElementById("promoResult").innerHTML = "";
        Panels.renderPromoList();
        break;
      case "profile":
        Panels.renderProfile();
        break;
      case "support":
        Panels.renderFaq();
        break;
    }
  }

  /* ---------- Haptics ---------- */
  function haptic(type = "light") {
    if (tg && tg.HapticFeedback) {
      try { tg.HapticFeedback.impactOccurred(type); } catch (e) {}
    }
  }

  /* ---------- Splash ---------- */
  function runSplash() {
    const splash = document.getElementById("splash");
    const fill = splash.querySelector(".splash-bar-fill");
    let w = 0;
    const iv = setInterval(() => {
      w += 15 + Math.random() * 25;
      if (w >= 100) { w = 100; }
      fill.style.width = w + "%";
      if (w >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          splash.classList.add("hidden");
          document.getElementById("app").style.visibility = "visible";
          document.getElementById("app").style.opacity = "1";
        }, 350);
      }
    }, 80);
  }

  /* ---------- Event wiring ---------- */
  function wireEvents() {
    // Nav tabs (top)
    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", () => { haptic("light"); goTo(tab.dataset.tab); });
    });
    // Bottom nav
    document.querySelectorAll(".b-nav-btn").forEach(btn => {
      btn.addEventListener("click", () => { haptic("light"); goTo(btn.dataset.tab); });
    });
    // Generic data-goto buttons
    document.addEventListener("click", (e) => {
      const go = e.target.closest("[data-goto]");
      if (go) { haptic("light"); goTo(go.dataset.goto); }
    });

    // Game search
    const gs = document.getElementById("gameSearch");
    gs.addEventListener("input", () => { Panels.renderGames(gs.value); });
    // Service search
    const ss = document.getElementById("serviceSearch");
    ss.addEventListener("input", () => { Panels.renderServices(ss.value); });

    // Promo
    document.getElementById("promoApply").addEventListener("click", () => {
      haptic("medium");
      document.getElementById("promoResult").innerHTML = "";
      Panels.applyPromo();
    });

    // Profile tabs
    document.querySelectorAll(".mini-tab").forEach(t => {
      t.addEventListener("click", () => {
        haptic("light");
        Panels.toggleProfileTab(t.dataset.mtab);
      });
    });

    // Support -> contact admin
    document.getElementById("supportBtn").addEventListener("click", contactAdmin);

    // Back button from game detail
    document.querySelectorAll(".back-btn[data-goto]").forEach(b => {
      b.addEventListener("click", () => goTo(b.dataset.goto));
    });

    // Menu button -> home
    document.getElementById("btnMenu").addEventListener("click", () => { haptic("light"); goTo("home"); });

    // Modal overlay click to close (not on modal itself)
    const overlay = document.getElementById("modalOverlay");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) UI.closeModal();
    });
  }

  /* ---------- Support: contact admin ---------- */
  function contactAdmin() {
    haptic("medium");
    const adminName = CONFIG.ADMIN_USERNAME || "GameDonat_Admin";
    const url = `https://t.me/${adminName}`;
    if (tg && tg.openTelegramLink) {
      try {
        tg.openTelegramLink(url);
        UI.toast("Admin chat'i ochilmoqda...", "info");
        return;
      } catch (e) {}
    }
    window.open(url, "_blank");
  }

  /* ---------- Boot ---------- */
  async function boot() {
    initTelegram();
    wireEvents();
    UI.initParticles();
    Panels.updateBalanceUI();

    // API rejim belgisi (videoda va brauzerda ko'rinadi)
    const badge = document.querySelector(".hero-badge");
    if (badge) {
      const live = API && API.MODE === "live";
      badge.textContent = live ? "● LIVE API" : "● DEMO API";
      badge.classList.add(live ? "api-live" : "api-sandbox");
    }

    // splash
    runSplash();
    document.getElementById("app").style.visibility = "hidden";
    document.getElementById("app").style.opacity = "0";

    // home default
    Panels.renderQuickStats();
    Panels.renderQuickGrid();
    Panels.renderHomeGames();

    // warm up API
    try { await API.ping(); } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", boot);

  return { goTo, showPanel };
})();
