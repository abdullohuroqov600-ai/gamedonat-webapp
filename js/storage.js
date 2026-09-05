/* ==========================================================================
   STORAGE — user profile, balance, history, promo claims
   ========================================================================== */
"use strict";

const Store = (() => {
  const KEY = "gamedonat_state_v1";

  const defaults = {
    balance: 150,
    userName: "O'yinchi",
    username: "",
    tgId: null,
    photo: "",
    history: [],
    claimedPromos: [],
    discountPct: 0,
    stats: null,
    firstVisitAt: Date.now()
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaults));
      return { ...defaults, ...JSON.parse(raw) };
    } catch (e) {
      return JSON.parse(JSON.stringify(defaults));
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* ignore quota errors */ }
  }

  function get() { return state; }

  function setBalance(v) {
    state.balance = Math.max(0, Math.round(v));
    save();
  }

  function addBalance(v) {
    setBalance(state.balance + v);
  }

  function addHistory(entry) {
    state.history.unshift({ ...entry, at: Date.now() });
    save();
  }

  function markPromoClaimed(code) {
    if (state.claimedPromos.indexOf(code) === -1) state.claimedPromos.push(code);
    save();
  }

  function setDiscount(pct) {
    state.discountPct = pct;
    save();
  }

  function setUser(u) {
    if (u.firstName) state.userName = u.firstName;
    if (u.username) state.username = u.username;
    if (u.id) state.tgId = u.id;
    if (u.photo) state.photo = u.photo;
    save();
  }

  function reset() {
    state = JSON.parse(JSON.stringify(defaults));
    save();
  }

  return { get, save, setBalance, addBalance, addHistory, markPromoClaimed, setDiscount, setUser, reset };
})();
