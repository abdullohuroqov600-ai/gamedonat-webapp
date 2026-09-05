/* ==========================================================================
   UI — helpers: toast, modal, particles, telegram theme binding
   ========================================================================== */
"use strict";

const UI = (() => {

  /* ---------- Toast ---------- */
  function toast(message, type = "info") {
    const wrap = document.getElementById("toastWrap");
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    const icons = { success: "✅", error: "❌", warn: "⚠️", info: "ℹ️" };
    el.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  /* ---------- Modal ---------- */
  function openModal({ icon = "💬", title = "", desc = "", actions = [] }) {
    const overlay = document.getElementById("modalOverlay");
    const box = document.getElementById("modalBox");
    box.innerHTML = `
      <div class="modal-ico">${icon}</div>
      <div class="modal-title">${title}</div>
      <div class="modal-desc">${desc}</div>
      <div class="modal-actions">${actions.map(a =>
        `<button class="btn ${a.cls || "btn-primary"}" data-action="${a.id}">${a.label}</button>`
      ).join("")}</div>
    `;
    box.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeModal();
        const action = actions.find(a => a.id === btn.dataset.action);
        if (action && action.onClick) action.onClick();
      });
    });
    overlay.classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("modalOverlay").classList.add("hidden");
  }

  /* ---------- Formatting ---------- */
  function fmtMoney(v) {
    return new Intl.NumberFormat("uz").format(Math.max(0, Math.round(v)));
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return "hozirgina";
    if (min < 60) return min + " daqiqa oldin";
    const h = Math.floor(min / 60);
    if (h < 24) return h + " soat oldin";
    return Math.floor(h / 24) + " kun oldin";
  }

  /* ---------- Particles background ---------- */
  function initParticles() {
    const canvas = document.getElementById("particlesCanvas");
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    let raf;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#22d3ee", "#a855f7", "#3b82f6", "#ec4899"];

    function spawn() {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
      if (particles.length > 120) particles.shift();
    }

    for (let i = 0; i < 60; i++) spawn();

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.pulse += 0.02;
        if (p.y < -10) { p.y = h + 10; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = Math.min(1, p.alpha + Math.sin(p.pulse) * 0.2);
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // occasional spawn to keep density
      if (Math.random() < 0.05) spawn();
      raf = requestAnimationFrame(draw);
    }
    draw();

    // stop when tab hidden
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) draw();
    });
  }

  return { toast, openModal, closeModal, fmtMoney, timeAgo, initParticles };
})();
