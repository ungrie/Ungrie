import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

/* ─── Constants ─────────────────────────────────────────────── */
const ADMIN_USER = "admin123";
const ADMIN_PASS = "admin123";

const PLANS = [
  {
    id: "Basic",
    price: "KD 15 / mo",
    color: "#a78b4e",
    features: [
      "Up to 50 menu items",
      "WhatsApp order updates",
      "Basic analytics",
      "1 branch",
    ],
  },
  {
    id: "Pro",
    price: "KD 35 / mo",
    color: "#c9a84c",
    features: [
      "Unlimited menu items",
      "Broadcast campaigns",
      "Advanced analytics",
      "3 branches",
      "Priority support",
    ],
  },
  {
    id: "Enterprise",
    price: "Custom",
    color: "#e8d5a3",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited branches",
      "SLA guarantee",
    ],
  },
];

const STEPS = ["Access", "Owner", "Restaurant", "Location", "Media", "Review"];

/* ─── Utilities ─────────────────────────────────────────────── */
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

/* ─── CSS ────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0d0d0e;
    --bg2:      #141416;
    --bg3:      #1c1c1f;
    --bg4:      #252528;
    --border:   rgba(255,255,255,.08);
    --border2:  rgba(255,255,255,.14);
    --gold:     #c9a84c;
    --gold2:    #e8d5a3;
    --gold-bg:  rgba(201,168,76,.08);
    --gold-border: rgba(201,168,76,.25);
    --text:     #f2f0ec;
    --text2:    #a09d98;
    --text3:    #5c5a56;
    --red:      #e05252;
    --red-bg:   rgba(224,82,82,.10);
    --green:    #52c97a;
    --green-bg: rgba(82,201,122,.10);
    --r:        12px;
    --r-sm:     8px;
    --r-lg:     18px;
    --shadow:   0 24px 80px rgba(0,0,0,.6);
    --shadow-sm:0 4px 20px rgba(0,0,0,.4);
    --font:     'DM Sans', sans-serif;
    --font-d:   'Playfair Display', serif;
    --trans:    all .3s cubic-bezier(.4,0,.2,1);
  }

  html, body { background: var(--bg); font-family: var(--font); color: var(--text); min-height: 100vh; }

  /* ── Layout ── */
  .ob-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    position: relative;
    overflow-x: hidden;
  }

  /* Animated background mesh */
  .ob-mesh {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 60% 50% at 10% 20%, rgba(201,168,76,.06) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 90% 80%, rgba(201,168,76,.04) 0%, transparent 70%),
      radial-gradient(ellipse 80% 40% at 50% 50%, rgba(255,255,255,.015) 0%, transparent 80%);
  }

  /* Grain overlay */
  .ob-grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: .025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  .ob-content {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .ob-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--border);
    background: rgba(13,13,14,.8);
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .ob-logo {
    font-family: var(--font-d);
    font-size: 22px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: .02em;
  }
  .ob-logo span { color: var(--text2); font-weight: 400; font-style: italic; font-size: 14px; margin-left: 8px; }
  .ob-header-tag {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--text3);
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 99px;
  }

  /* ── Step indicator ── */
  .ob-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 28px 40px;
    flex-wrap: wrap;
    gap: 4px;
  }
  .ob-step-item {
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: .35;
    transition: var(--trans);
  }
  .ob-step-item.done { opacity: .6; }
  .ob-step-item.active { opacity: 1; }
  .ob-step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1.5px solid var(--border2);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    color: var(--text3);
    transition: var(--trans);
    flex-shrink: 0;
  }
  .ob-step-item.done .ob-step-dot {
    background: var(--gold-bg);
    border-color: var(--gold-border);
    color: var(--gold);
  }
  .ob-step-item.active .ob-step-dot {
    background: var(--gold);
    border-color: var(--gold);
    color: #000;
    box-shadow: 0 0 20px rgba(201,168,76,.4);
  }
  .ob-step-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--text2);
  }
  .ob-step-item.active .ob-step-label { color: var(--gold); }
  .ob-step-line {
    width: 32px; height: 1px;
    background: var(--border);
    flex-shrink: 0;
    margin: 0 2px;
  }
  @media(max-width:640px){
    .ob-step-label{display:none;}
    .ob-step-line{width:16px;}
    .ob-steps{padding:20px 20px;}
  }

  /* ── Main card ── */
  .ob-main {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 0 20px 60px;
  }
  .ob-card {
    width: 100%;
    max-width: 680px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
    animation: cardIn .5s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ob-card-hd {
    padding: 32px 36px 24px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, rgba(201,168,76,.04) 0%, transparent 60%);
  }
  .ob-card-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }
  .ob-card-title {
    font-family: var(--font-d);
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
    margin-bottom: 6px;
  }
  .ob-card-sub {
    font-size: 13.5px;
    color: var(--text2);
    line-height: 1.55;
  }
  .ob-card-body { padding: 28px 36px 32px; }
  @media(max-width:500px){
    .ob-card-hd,.ob-card-body{padding-left:20px;padding-right:20px;}
    .ob-card-title{font-size:22px;}
  }

  /* ── Form elements ── */
  .ob-field { margin-bottom: 20px; }
  .ob-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--text2);
    margin-bottom: 7px;
  }
  .ob-label span { color: var(--gold); margin-left: 2px; }
  .ob-input, .ob-select, .ob-textarea {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: var(--r-sm);
    padding: 12px 14px;
    font-size: 14px;
    font-family: var(--font);
    color: var(--text);
    outline: none;
    transition: var(--trans);
    appearance: none;
  }
  .ob-input:focus, .ob-select:focus, .ob-textarea:focus {
    border-color: var(--gold);
    background: var(--bg4);
    box-shadow: 0 0 0 3px rgba(201,168,76,.12);
  }
  .ob-input::placeholder, .ob-textarea::placeholder { color: var(--text3); }
  .ob-select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a09d98' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
  .ob-textarea { resize: vertical; min-height: 80px; }
  .ob-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media(max-width:500px){ .ob-row{grid-template-columns:1fr;} }

  .ob-err {
    margin-top: 6px;
    font-size: 12px;
    color: var(--red);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ob-hint {
    margin-top: 5px;
    font-size: 12px;
    color: var(--text3);
  }
  .ob-ok { margin-top: 6px; font-size: 12px; color: var(--green); }

  /* ── Buttons ── */
  .ob-btn-primary {
    width: 100%;
    padding: 14px 20px;
    background: var(--gold);
    color: #0d0d0e;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: .04em;
    border: none;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: var(--trans);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }
  .ob-btn-primary:hover:not(:disabled) {
    background: var(--gold2);
    transform: translateY(-1px);
    box-shadow: 0 8px 30px rgba(201,168,76,.3);
  }
  .ob-btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; }

  .ob-btn-ghost {
    padding: 12px 20px;
    background: transparent;
    color: var(--text2);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 600;
    border: 1px solid var(--border2);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: var(--trans);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ob-btn-ghost:hover { border-color: var(--gold-border); color: var(--gold); background: var(--gold-bg); }

  .ob-footer-btns {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    align-items: center;
  }
  .ob-footer-btns .ob-btn-primary { flex: 1; margin-top: 0; }

  /* ── Login ── */
  .ob-login-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    z-index: 2;
  }
  .ob-login-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
    animation: cardIn .6s cubic-bezier(.4,0,.2,1) both;
  }
  .ob-login-top {
    padding: 40px 36px 28px;
    background: linear-gradient(135deg, rgba(201,168,76,.06) 0%, transparent 60%);
    border-bottom: 1px solid var(--border);
    text-align: center;
  }
  .ob-login-icon {
    width: 56px; height: 56px;
    border-radius: 16px;
    background: var(--gold-bg);
    border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
    font-size: 24px;
  }
  .ob-login-title { font-family: var(--font-d); font-size: 26px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .ob-login-sub { font-size: 13px; color: var(--text2); }

  /* ── Password toggle ── */
  .ob-pw-wrap { position: relative; }
  .ob-pw-wrap .ob-input { padding-right: 42px; }
  .ob-pw-eye {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; color: var(--text3);
    padding: 4px;
    transition: color .15s;
  }
  .ob-pw-eye:hover { color: var(--gold); }

  /* ── Plans ── */
  .ob-plans { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .ob-plan {
    border: 1.5px solid var(--border);
    border-radius: var(--r);
    padding: 16px 18px;
    cursor: pointer;
    transition: var(--trans);
    position: relative;
    overflow: hidden;
  }
  .ob-plan::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: transparent;
    transition: var(--trans);
  }
  .ob-plan:hover { border-color: var(--border2); background: var(--bg3); }
  .ob-plan.sel { border-color: var(--gold-border); background: var(--gold-bg); }
  .ob-plan.sel::before { background: var(--gold); }
  .ob-plan-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .ob-plan-name { font-size: 15px; font-weight: 700; color: var(--text); }
  .ob-plan-price { font-size: 13px; font-weight: 600; color: var(--gold); }
  .ob-plan-feats { display: flex; flex-wrap: wrap; gap: 6px; }
  .ob-plan-feat { font-size: 11px; color: var(--text2); background: var(--bg4); border: 1px solid var(--border); border-radius: 99px; padding: 3px 9px; }

  /* ── Date range ── */
  .ob-date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── Owner cards ── */
  .ob-owner-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; max-height: 240px; overflow-y: auto; }
  .ob-owner-card {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: var(--trans);
  }
  .ob-owner-card:hover { border-color: var(--border2); background: var(--bg3); }
  .ob-owner-card.sel { border-color: var(--gold-border); background: var(--gold-bg); }
  .ob-owner-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: var(--bg4);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-d);
    font-size: 15px;
    font-weight: 700;
    color: var(--gold);
    flex-shrink: 0;
  }
  .ob-owner-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .ob-owner-ph { font-size: 12px; color: var(--text2); }
  .ob-owner-check { margin-left: auto; color: var(--gold); flex-shrink: 0; }

  /* ── Tabs (existing/new owner) ── */
  .ob-tabs { display: flex; border: 1px solid var(--border); border-radius: var(--r-sm); padding: 3px; gap: 3px; margin-bottom: 24px; }
  .ob-tab {
    flex: 1; padding: 9px 12px;
    font-size: 13px; font-weight: 600;
    border-radius: 6px;
    border: none; background: none;
    color: var(--text2); cursor: pointer;
    transition: var(--trans);
    font-family: var(--font);
  }
  .ob-tab.active { background: var(--gold); color: #000; }

  /* ── Map ── */
  .ob-map-wrap {
    height: 280px;
    border-radius: var(--r);
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 14px;
    position: relative;
  }
  #ob-leaflet { width: 100%; height: 100%; }
  .ob-map-instruction {
    position: absolute;
    top: 10px; left: 50%;
    transform: translateX(-50%);
    background: rgba(13,13,14,.85);
    border: 1px solid var(--border2);
    color: var(--text2);
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 99px;
    backdrop-filter: blur(8px);
    pointer-events: none;
    white-space: nowrap;
    z-index: 500;
  }
  .ob-coords {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* ── Hours ── */
  .ob-hours-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
  .ob-hours-sep { color: var(--text3); font-size: 13px; text-align: center; }

  /* ── Image upload ── */
  .ob-img-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 8px; }
  .ob-img-slot {
    aspect-ratio: 16/9;
    border: 1.5px dashed var(--border2);
    border-radius: var(--r-sm);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 6px; cursor: pointer;
    transition: var(--trans);
    position: relative;
    overflow: hidden;
    background: var(--bg3);
  }
  .ob-img-slot:hover { border-color: var(--gold-border); background: var(--gold-bg); }
  .ob-img-slot img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .ob-img-slot-label { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: .06em; text-transform: uppercase; }
  .ob-img-slot-icon { font-size: 22px; }
  .ob-img-slot .ob-img-remove {
    position: absolute; top: 6px; right: 6px;
    background: rgba(0,0,0,.7); color: #fff;
    border: none; border-radius: 50%;
    width: 24px; height: 24px;
    font-size: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    transition: background .15s;
  }
  .ob-img-slot .ob-img-remove:hover { background: var(--red); }
  .ob-img-url-list { display: flex; flex-direction: column; gap: 8px; }
  .ob-img-url-row { display: flex; gap: 8px; align-items: center; }
  .ob-img-url-row .ob-input { flex: 1; }
  .ob-img-url-preview {
    width: 38px; height: 38px; border-radius: 6px;
    object-fit: cover; border: 1px solid var(--border);
    flex-shrink: 0;
  }

  /* ── Review ── */
  .ob-review-section { margin-bottom: 20px; }
  .ob-review-title {
    font-size: 10px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .ob-review-title::after { content:''; flex:1; height:1px; background:var(--border); }
  .ob-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @media(max-width:500px){ .ob-review-grid{grid-template-columns:1fr;} }
  .ob-review-item { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 10px 12px; }
  .ob-review-key { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text3); margin-bottom: 3px; }
  .ob-review-val { font-size: 13px; font-weight: 600; color: var(--text); word-break: break-all; }

  /* ── Alert ── */
  .ob-alert {
    padding: 12px 14px;
    border-radius: var(--r-sm);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .ob-alert.err { background: var(--red-bg); border: 1px solid rgba(224,82,82,.3); color: var(--red); }
  .ob-alert.ok  { background: var(--green-bg); border: 1px solid rgba(82,201,122,.3); color: var(--green); }

  /* ── Spinner ── */
  .ob-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(0,0,0,.2);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Slug badge ── */
  .ob-slug-preview {
    margin-top: 7px;
    font-size: 12px;
    color: var(--text3);
    font-family: 'Courier New', monospace;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ob-slug-preview span { color: var(--gold); }

  /* ── Success ── */
  .ob-success {
    text-align: center;
    padding: 40px 20px;
    animation: cardIn .5s both;
  }
  .ob-success-icon { font-size: 56px; margin-bottom: 20px; }
  .ob-success-title { font-family: var(--font-d); font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
  .ob-success-sub { font-size: 14px; color: var(--text2); line-height: 1.6; max-width: 420px; margin: 0 auto 28px; }
  .ob-success-slug {
    display: inline-block;
    background: var(--gold-bg);
    border: 1px solid var(--gold-border);
    color: var(--gold);
    font-family: monospace;
    font-size: 14px;
    padding: 8px 18px;
    border-radius: 8px;
    margin-bottom: 28px;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text3); }
`;

/* ─── Leaflet loader ─────────────────────────────────────────── */
let leafletLoaded = false;
function loadLeaflet(cb) {
  if (leafletLoaded && window.L) {
    cb();
    return;
  }
  if (document.getElementById("ob-leaflet-css")) {
    const check = setInterval(() => {
      if (window.L) {
        clearInterval(check);
        leafletLoaded = true;
        cb();
      }
    }, 50);
    return;
  }
  const link = document.createElement("link");
  link.id = "ob-leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
  const script = document.createElement("script");
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = () => {
    leafletLoaded = true;
    cb();
  };
  document.head.appendChild(script);
}

/* ─── Sub-components ─────────────────────────────────────────── */

function EyeIcon({ show }) {
  return show ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Field({ label, required, hint, err, ok, children }) {
  return (
    <div className="ob-field">
      {label && (
        <label className="ob-label">
          {label}
          {required && <span>*</span>}
        </label>
      )}
      {children}
      {hint && !err && <div className="ob-hint">{hint}</div>}
      {err && <div className="ob-err">⚠ {err}</div>}
      {ok && <div className="ob-ok">✓ {ok}</div>}
    </div>
  );
}

function PwField({ label, value, onChange, placeholder, required, err }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required={required} err={err}>
      <div className="ob-pw-wrap">
        <input
          type={show ? "text" : "password"}
          className="ob-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          className="ob-pw-eye"
          type="button"
          onClick={() => setShow((s) => !s)}
        >
          <EyeIcon show={show} />
        </button>
      </div>
    </Field>
  );
}

/* ─── Step 0: Login ──────────────────────────────────────────── */
function LoginStep({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      onLogin();
    } else {
      setErr("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="ob-login-wrap">
      <div className="ob-login-card">
        <div className="ob-login-top">
          <div className="ob-login-icon">🏛️</div>
          <div className="ob-login-title">Ungrie Admin</div>
          <div className="ob-login-sub">Restaurant onboarding portal</div>
        </div>
        <form onSubmit={submit} style={{ padding: "28px 36px 32px" }}>
          {err && <div className="ob-alert err">⚠ {err}</div>}
          <Field label="Username" required>
            <input
              className="ob-input"
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="admin username"
              autoComplete="username"
            />
          </Field>
          <PwField
            label="Password"
            required
            value={p}
            onChange={(e) => setP(e.target.value)}
            placeholder="••••••••"
          />
          <button
            className="ob-btn-primary"
            type="submit"
            disabled={loading || !u || !p}
          >
            {loading ? (
              <>
                <div className="ob-spinner" />
                Authenticating…
              </>
            ) : (
              "Access portal →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Step 1: Owner ──────────────────────────────────────────── */
function OwnerStep({ data, setData, onNext }) {
  const [tab, setTab] = useState("existing"); // "existing" | "new"
  const [owners, setOwners] = useState([]);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [slugErr, setSlugErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    ph_no: "",
    username: "",
    password: "",
  });
  const [formErr, setFormErr] = useState({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("Owner")
        .select("id, name, ph_no, username")
        .order("name");
      setOwners(rows || []);
      setOwnerLoading(false);
    })();
  }, []);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validateNew = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.ph_no.trim()) e.ph_no = "Phone is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const handleNew = async () => {
    if (!validateNew()) return;
    setSaving(true);
    setAlert(null);
    try {
      // Check username unique
      const { data: ex } = await supabase
        .from("Owner")
        .select("id")
        .eq("username", form.username)
        .maybeSingle();
      if (ex) {
        setFormErr((p) => ({ ...p, username: "Username already taken" }));
        setSaving(false);
        return;
      }
      const { data: row, error } = await supabase
        .from("Owner")
        .insert({
          name: form.name.trim(),
          ph_no: form.ph_no.trim(),
          username: form.username.trim(),
          password: form.password,
        })
        .select()
        .single();
      if (error) throw error;
      setData((p) => ({ ...p, owner: row, ownerMode: "new" }));
      setAlert({
        type: "ok",
        msg: `Owner "${row.name}" created successfully.`,
      });
      onNext();
    } catch (e) {
      setAlert({ type: "err", msg: e.message || "Failed to create owner." });
    } finally {
      setSaving(false);
    }
  };

  const selectExisting = (o) =>
    setData((p) => ({ ...p, owner: o, ownerMode: "existing" }));

  const canNext = tab === "existing" ? !!data.owner : false;

  return (
    <div>
      {alert && <div className={`ob-alert ${alert.type}`}>{alert.msg}</div>}
      <div className="ob-tabs">
        <button
          className={`ob-tab${tab === "existing" ? " active" : ""}`}
          onClick={() => setTab("existing")}
        >
          Select existing owner
        </button>
        <button
          className={`ob-tab${tab === "new" ? " active" : ""}`}
          onClick={() => setTab("new")}
        >
          Create new owner
        </button>
      </div>

      {tab === "existing" && (
        <>
          {ownerLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "30px 0",
              }}
            >
              <div
                className="ob-spinner"
                style={{
                  borderTopColor: "var(--gold)",
                  borderColor: "rgba(201,168,76,.2)",
                }}
              />
            </div>
          ) : owners.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "var(--text3)",
                fontSize: 13,
              }}
            >
              No owners yet — create one using the tab above.
            </div>
          ) : (
            <div className="ob-owner-list">
              {owners.map((o) => (
                <div
                  key={o.id}
                  className={`ob-owner-card${data.owner?.id === o.id ? " sel" : ""}`}
                  onClick={() => selectExisting(o)}
                >
                  <div className="ob-owner-avatar">
                    {o.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="ob-owner-name">{o.name}</div>
                    <div className="ob-owner-ph">
                      {o.ph_no} · @{o.username}
                    </div>
                  </div>
                  {data.owner?.id === o.id && (
                    <div className="ob-owner-check">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            className="ob-btn-primary"
            disabled={!data.owner}
            onClick={onNext}
          >
            Continue with{" "}
            {data.owner ? `"${data.owner.name}"` : "selected owner"} →
          </button>
        </>
      )}

      {tab === "new" && (
        <>
          <div className="ob-row">
            <Field label="Full name" required err={formErr.name}>
              <input
                className="ob-input"
                value={form.name}
                onChange={f("name")}
                placeholder="Jane Smith"
              />
            </Field>
            <Field label="Phone number" required err={formErr.ph_no}>
              <input
                className="ob-input"
                value={form.ph_no}
                onChange={f("ph_no")}
                placeholder="+965 XXXX XXXX"
              />
            </Field>
          </div>
          <div className="ob-row">
            <Field label="Username" required err={formErr.username}>
              <input
                className="ob-input"
                value={form.username}
                onChange={f("username")}
                placeholder="janesmith"
                autoComplete="off"
              />
            </Field>
            <PwField
              label="Password"
              required
              value={form.password}
              onChange={f("password")}
              placeholder="min 6 characters"
              err={formErr.password}
            />
          </div>
          <button
            className="ob-btn-primary"
            disabled={saving}
            onClick={handleNew}
          >
            {saving ? (
              <>
                <div className="ob-spinner" />
                Creating owner…
              </>
            ) : (
              "Create owner & continue →"
            )}
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Step 2: Restaurant basics ─────────────────────────────── */
function RestaurantStep({ data, setData, onNext, onBack }) {
  const [form, setForm] = useState({
    name: data.rest?.name || "",
    branch_name: data.rest?.branch_name || "",
    ph_no: data.rest?.ph_no || "",
    address: data.rest?.address || "",
    slug: data.rest?.slug || "",
    plan: data.rest?.plan || "Basic",
    plan_start: data.rest?.plan_start || new Date().toISOString().split("T")[0],
    plan_expiry: data.rest?.plan_expiry || "",
    working_from: data.rest?.working_from || "10:00",
    working_to: data.rest?.working_to || "23:00",
    min_order: data.rest?.min_order || "",
  });
  const [slugStatus, setSlugStatus] = useState(null); // null | "checking" | "ok" | "taken"
  const [formErr, setFormErr] = useState({});
  const slugTimer = useRef(null);

  const f = (k) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
    if (k === "name" && !data.rest?.slug) {
      const auto = slugify(val);
      setForm((p) => ({ ...p, [k]: val, slug: auto }));
      checkSlug(auto);
    }
    if (k === "slug") checkSlug(val);
  };

  const checkSlug = (val) => {
    clearTimeout(slugTimer.current);
    if (!val) {
      setSlugStatus(null);
      return;
    }
    setSlugStatus("checking");
    slugTimer.current = setTimeout(async () => {
      const { data: ex } = await supabase
        .from("Restaurants")
        .select("id")
        .eq("slug", slugify(val))
        .maybeSingle();
      setSlugStatus(ex ? "taken" : "ok");
    }, 500);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Restaurant name is required";
    if (!form.ph_no.trim()) e.ph_no = "Phone number is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (slugStatus === "taken") e.slug = "This slug is already taken";
    if (!form.plan) e.plan = "Select a subscription plan";
    if (!form.plan_start) e.plan_start = "Start date required";
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setData((p) => ({ ...p, rest: { ...p.rest, ...form } }));
    onNext();
  };

  return (
    <div>
      <div className="ob-row">
        <Field label="Restaurant name" required err={formErr.name}>
          <input
            className="ob-input"
            value={form.name}
            onChange={f("name")}
            placeholder="Mix & Munch"
          />
        </Field>
        <Field label="Branch / location" hint="e.g. Kuwait City, Salmiya">
          <input
            className="ob-input"
            value={form.branch_name}
            onChange={f("branch_name")}
            placeholder="Kuwait City"
          />
        </Field>
      </div>
      <div className="ob-row">
        <Field label="Phone number" required err={formErr.ph_no}>
          <input
            className="ob-input"
            value={form.ph_no}
            onChange={f("ph_no")}
            placeholder="+965 XXXX XXXX"
          />
        </Field>
        <Field label="Min. order (KD)" hint="Leave blank if no minimum">
          <input
            className="ob-input"
            type="number"
            step="0.001"
            value={form.min_order}
            onChange={f("min_order")}
            placeholder="2.000"
          />
        </Field>
      </div>
      <Field label="Address">
        <input
          className="ob-input"
          value={form.address}
          onChange={f("address")}
          placeholder="Block 3, Al-Soor St, Kuwait City"
        />
      </Field>

      {/* Slug */}
      <Field
        label="URL slug"
        required
        err={
          formErr.slug ||
          (slugStatus === "taken" ? "This slug is already taken" : "")
        }
        ok={slugStatus === "ok" ? "Slug is available ✓" : ""}
        hint={slugStatus === "checking" ? "Checking availability…" : ""}
      >
        <input
          className="ob-input"
          value={form.slug}
          onChange={f("slug")}
          placeholder="mix-and-munch"
          onBlur={() => checkSlug(form.slug)}
          style={{
            borderColor:
              slugStatus === "taken"
                ? "var(--red)"
                : slugStatus === "ok"
                  ? "var(--green)"
                  : "",
          }}
        />
        {form.slug && (
          <div className="ob-slug-preview">
            🔗 ungrie.com/<span>{slugify(form.slug) || "…"}</span>
          </div>
        )}
      </Field>

      {/* Working hours */}
      <Field label="Working hours">
        <div className="ob-hours-row">
          <input
            className="ob-input"
            type="time"
            value={form.working_from}
            onChange={f("working_from")}
          />
          <div className="ob-hours-sep">→</div>
          <input
            className="ob-input"
            type="time"
            value={form.working_to}
            onChange={f("working_to")}
          />
        </div>
        {form.working_from && form.working_to && (
          <div className="ob-hint">
            {fmt12(form.working_from)} – {fmt12(form.working_to)}
          </div>
        )}
      </Field>

      {/* Plan */}
      <Field label="Subscription plan" required err={formErr.plan}>
        <div className="ob-plans">
          {PLANS.map((pl) => (
            <div
              key={pl.id}
              className={`ob-plan${form.plan === pl.id ? " sel" : ""}`}
              onClick={() => setForm((p) => ({ ...p, plan: pl.id }))}
            >
              <div className="ob-plan-top">
                <span className="ob-plan-name">{pl.id}</span>
                <span className="ob-plan-price">{pl.price}</span>
              </div>
              <div className="ob-plan-feats">
                {pl.features.map((ft) => (
                  <span key={ft} className="ob-plan-feat">
                    ✓ {ft}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Field>

      {/* Plan dates */}
      <div className="ob-row">
        <Field label="Plan start date" required err={formErr.plan_start}>
          <input
            className="ob-input"
            type="date"
            value={form.plan_start}
            onChange={f("plan_start")}
          />
        </Field>
        <Field label="Plan expiry date" hint="Leave blank for open-ended">
          <input
            className="ob-input"
            type="date"
            value={form.plan_expiry}
            onChange={f("plan_expiry")}
          />
        </Field>
      </div>

      <div className="ob-footer-btns">
        <button className="ob-btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          className="ob-btn-primary"
          onClick={handleNext}
          disabled={slugStatus === "taken"}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3: Location (map) ─────────────────────────────────── */
function LocationStep({ data, setData, onNext, onBack }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [lat, setLat] = useState(data.rest?.latitude || "29.3759");
  const [lng, setLng] = useState(data.rest?.longitude || "47.9774");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet(() => {
      if (cancelled || !mapRef.current || leafletMapRef.current) return;
      const L = window.L;
      const initLat = parseFloat(lat) || 29.3759;
      const initLng = parseFloat(lng) || 47.9774;

      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [initLat, initLng],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OSM contributors",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="width:22px;height:22px;border-radius:50%;background:#c9a84c;border:3px solid #fff;box-shadow:0 2px 12px rgba(201,168,76,.5)"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        className: "",
      });

      const marker = L.marker([initLat, initLng], {
        icon,
        draggable: true,
      }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLat(pos.lat.toFixed(6));
        setLng(pos.lng.toFixed(6));
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat.toFixed(6));
        setLng(e.latlng.lng.toFixed(6));
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Sync marker when inputs change manually
  useEffect(() => {
    const la = parseFloat(lat),
      ln = parseFloat(lng);
    if (
      !isNaN(la) &&
      !isNaN(ln) &&
      markerRef.current &&
      leafletMapRef.current
    ) {
      markerRef.current.setLatLng([la, ln]);
      leafletMapRef.current.setView([la, ln], leafletMapRef.current.getZoom());
    }
  }, [lat, lng]);

  const handleNext = () => {
    const la = parseFloat(lat),
      ln = parseFloat(lng);
    if (isNaN(la) || isNaN(ln)) {
      alert("Please set a valid location on the map.");
      return;
    }
    setData((p) => ({
      ...p,
      rest: { ...p.rest, latitude: la, longitude: ln },
    }));
    onNext();
  };

  return (
    <div>
      <div className="ob-map-wrap">
        <div ref={mapRef} id="ob-leaflet" />
        <div className="ob-map-instruction">
          📍 Click on the map or drag the pin to set location
        </div>
      </div>
      <div className="ob-coords">
        <Field label="Latitude">
          <input
            className="ob-input"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="29.3759"
          />
        </Field>
        <Field label="Longitude">
          <input
            className="ob-input"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="47.9774"
          />
        </Field>
      </div>
      <div className="ob-footer-btns">
        <button className="ob-btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="ob-btn-primary" onClick={handleNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4: Logo + Banner images ─────────────────────────── */
function MediaStep({ data, setData, onNext, onBack }) {
  const [logo, setLogo] = useState(data.rest?.logo_path || "");
  const [images, setImages] = useState([
    data.rest?.image1_path || "",
    data.rest?.image2_path || "",
    data.rest?.image3_path || "",
    data.rest?.image4_path || "",
  ]);
  const [logoErr, setLogoErr] = useState(false);
  const [imgErrs, setImgErrs] = useState([false, false, false, false]);

  const setImg = (i, val) =>
    setImages((prev) => {
      const n = [...prev];
      n[i] = val;
      return n;
    });

  const handleNext = () => {
    setData((p) => ({
      ...p,
      rest: {
        ...p.rest,
        logo_path: logo.trim(),
        image1_path: images[0].trim(),
        image2_path: images[1].trim(),
        image3_path: images[2].trim(),
        image4_path: images[3].trim(),
      },
    }));
    onNext();
  };

  return (
    <div>
      {/* Logo */}
      <Field
        label="Logo image URL"
        hint="Paste a publicly accessible image URL (PNG/SVG recommended)"
      >
        <input
          className="ob-input"
          value={logo}
          onChange={(e) => {
            setLogo(e.target.value);
            setLogoErr(false);
          }}
          placeholder="https://yourcdn.com/logo.png"
        />
        {logo && !logoErr && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src={logo}
              alt="logo preview"
              onError={() => setLogoErr(true)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                objectFit: "contain",
                background: "var(--bg4)",
                border: "1px solid var(--border)",
                padding: 4,
              }}
            />
            <span style={{ fontSize: 12, color: "var(--green)" }}>
              ✓ Logo loaded
            </span>
          </div>
        )}
        {logoErr && (
          <div className="ob-err">⚠ Could not load image — check the URL</div>
        )}
      </Field>

      {/* Banner images */}
      <Field
        label="Banner images"
        hint="Up to 4 images for the hero slideshow. Paste public URLs below."
      >
        <div className="ob-img-url-list">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ob-img-url-row">
              {images[i] && !imgErrs[i] && (
                <img
                  src={images[i]}
                  alt={`banner ${i + 1}`}
                  className="ob-img-url-preview"
                  onError={() =>
                    setImgErrs((p) => {
                      const n = [...p];
                      n[i] = true;
                      return n;
                    })
                  }
                />
              )}
              {imgErrs[i] && (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 6,
                    background: "var(--red-bg)",
                    border: "1px solid var(--red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 16 }}>✕</span>
                </div>
              )}
              <input
                className="ob-input"
                value={images[i]}
                onChange={(e) => {
                  setImg(i, e.target.value);
                  setImgErrs((p) => {
                    const n = [...p];
                    n[i] = false;
                    return n;
                  });
                }}
                placeholder={`Banner ${i + 1} URL (optional)`}
              />
            </div>
          ))}
        </div>
      </Field>

      <div className="ob-footer-btns">
        <button className="ob-btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="ob-btn-primary" onClick={handleNext}>
          Review & submit →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 5: Review + Submit ────────────────────────────────── */
function ReviewStep({ data, onBack, onSubmit, submitting, submitErr }) {
  const { owner, rest } = data;
  const wh =
    rest?.working_from && rest?.working_to
      ? `${fmt12(rest.working_from)} – ${fmt12(rest.working_to)}`
      : "Not set";

  const rows = [
    ["Owner", owner?.name],
    ["Owner phone", owner?.ph_no],
    ["Restaurant", rest?.name],
    ["Branch", rest?.branch_name || "—"],
    ["Phone", rest?.ph_no],
    ["Address", rest?.address || "—"],
    ["Slug", `ungrie.com/${rest?.slug}`],
    ["Plan", rest?.plan],
    ["Plan start", rest?.plan_start || "—"],
    ["Plan expiry", rest?.plan_expiry || "Open-ended"],
    ["Working hours", wh],
    ["Min. order", rest?.min_order ? `KD ${rest.min_order}` : "—"],
    ["Latitude", rest?.latitude],
    ["Longitude", rest?.longitude],
    ["Logo", rest?.logo_path ? "Set" : "Not set"],
    [
      "Banners",
      [
        rest?.image1_path,
        rest?.image2_path,
        rest?.image3_path,
        rest?.image4_path,
      ].filter(Boolean).length + " image(s)",
    ],
  ];

  return (
    <div>
      {submitErr && <div className="ob-alert err">⚠ {submitErr}</div>}
      <div className="ob-review-section">
        <div className="ob-review-title">Summary</div>
        <div className="ob-review-grid">
          {rows.map(([k, v]) => (
            <div key={k} className="ob-review-item">
              <div className="ob-review-key">{k}</div>
              <div className="ob-review-val">{v || "—"}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ob-footer-btns">
        <button className="ob-btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          className="ob-btn-primary"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="ob-spinner" />
              Creating restaurant…
            </>
          ) : (
            "✦ Onboard restaurant"
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── STEP CONFIGS ───────────────────────────────────────────── */
const STEP_META = [
  {
    eyebrow: "Portal access",
    title: "Welcome back",
    sub: "Sign in to the Ungrie onboarding portal to continue.",
  },
  {
    eyebrow: "Step 1 of 5 — Owner",
    title: "Owner profile",
    sub: "Select an existing owner or create a new one for this restaurant.",
  },
  {
    eyebrow: "Step 2 of 5 — Restaurant",
    title: "Restaurant details",
    sub: "Fill in the core information for this restaurant.",
  },
  {
    eyebrow: "Step 3 of 5 — Location",
    title: "Set location",
    sub: "Pin the restaurant on the map. Drag the marker or click to reposition.",
  },
  {
    eyebrow: "Step 4 of 5 — Media",
    title: "Logo & banners",
    sub: "Add the restaurant logo and hero slideshow images.",
  },
  {
    eyebrow: "Step 5 of 5 — Review",
    title: "Review & submit",
    sub: "Double-check all details before creating the restaurant.",
  },
];

/* ─── ROOT ───────────────────────────────────────────────────── */
export default function Onboard() {
  const [authed, setAuthed] = useState(false);
  const [step, setStep] = useState(1); // 1=owner, 2=rest, 3=loc, 4=media, 5=review
  const [data, setData] = useState({ owner: null, ownerMode: null, rest: {} });
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [done, setDone] = useState(null); // created restaurant row

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const { owner, rest } = data;
      if (!owner?.id) throw new Error("No owner selected.");
      if (!rest?.name || !rest?.slug)
        throw new Error("Restaurant name and slug are required.");

      // Double-check slug uniqueness
      const { data: ex } = await supabase
        .from("Restaurants")
        .select("id")
        .eq("slug", slugify(rest.slug))
        .maybeSingle();
      if (ex) throw new Error(`Slug "${rest.slug}" is already taken.`);

      const payload = {
        owner_id: owner.id,
        name: rest.name.trim(),
        branch_name: rest.branch_name?.trim() || null,
        ph_no: rest.ph_no?.trim() || "",
        address: rest.address?.trim() || null,
        latitude: parseFloat(rest.latitude) || 0,
        longitude: parseFloat(rest.longitude) || 0,
        slug: slugify(rest.slug),
        sub_plan: rest.plan || "Basic",
        working_hours:
          rest.working_from && rest.working_to
            ? `${fmt12(rest.working_from)} – ${fmt12(rest.working_to)}`
            : null,
        min_order: rest.min_order ? parseInt(rest.min_order) : null,
        logo_path: rest.logo_path || null,
        image1_path: rest.image1_path || null,
        image2_path: rest.image2_path || null,
        image3_path: rest.image3_path || null,
        image4_path: rest.image4_path || null,
        accept_delivery: true,
        accept_pickup: true,
      };

      const { data: newRest, error } = await supabase
        .from("Restaurants")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      // Update owner's main_rest if they don't have one yet
      if (!owner.main_rest) {
        await supabase
          .from("Owner")
          .update({ main_rest: newRest.id })
          .eq("id", owner.id);
      }

      setDone(newRest);
    } catch (e) {
      setSubmitErr(e.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDone(null);
    setData({ owner: null, ownerMode: null, rest: {} });
    setStep(1);
    setSubmitErr("");
  };

  const displayStep = authed ? step : 0;
  const meta = STEP_META[displayStep] || STEP_META[0];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ob-root">
        <div className="ob-mesh" />
        <div className="ob-grain" />
        <div className="ob-content">
          {!authed ? (
            <LoginStep onLogin={() => setAuthed(true)} />
          ) : done ? (
            /* ── Success ── */
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 560,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                  boxShadow: "var(--shadow)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,168,76,.08) 0%, transparent 60%)",
                    padding: "40px 36px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="ob-success">
                    <div className="ob-success-icon">🎉</div>
                    <div className="ob-success-title">
                      Restaurant onboarded!
                    </div>
                    <div className="ob-success-sub">
                      <strong style={{ color: "var(--text)" }}>
                        {done.name}
                      </strong>
                      {done.branch_name ? ` · ${done.branch_name}` : ""} is now
                      live on Ungrie. Share the link with the restaurant owner.
                    </div>
                    <div className="ob-success-slug">
                      🔗 ungrie.com/{done.slug}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="ob-btn-ghost"
                        onClick={() => window.open(`/dashboard`, "_blank")}
                      >
                        Open dashboard ↗
                      </button>
                      <button
                        className="ob-btn-primary"
                        style={{
                          width: "auto",
                          padding: "12px 24px",
                          marginTop: 0,
                        }}
                        onClick={reset}
                      >
                        + Onboard another
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="ob-header">
                <div className="ob-logo">
                  Ungrie <span>onboarding portal</span>
                </div>
                <div className="ob-header-tag">Admin access</div>
              </header>

              {/* Steps indicator */}
              <div className="ob-steps">
                {STEPS.slice(1).map((s, i) => {
                  const idx = i + 1;
                  const status =
                    idx < step ? "done" : idx === step ? "active" : "";
                  return (
                    <div
                      key={s}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <div className={`ob-step-item ${status}`}>
                        <div className="ob-step-dot">
                          {idx < step ? (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            idx
                          )}
                        </div>
                        <span className="ob-step-label">{s}</span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className="ob-step-line" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Card */}
              <div className="ob-main">
                <div className="ob-card" key={step}>
                  <div className="ob-card-hd">
                    <div className="ob-card-eyebrow">{meta.eyebrow}</div>
                    <div className="ob-card-title">{meta.title}</div>
                    <div className="ob-card-sub">{meta.sub}</div>
                  </div>
                  <div className="ob-card-body">
                    {step === 1 && (
                      <OwnerStep data={data} setData={setData} onNext={next} />
                    )}
                    {step === 2 && (
                      <RestaurantStep
                        data={data}
                        setData={setData}
                        onNext={next}
                        onBack={back}
                      />
                    )}
                    {step === 3 && (
                      <LocationStep
                        data={data}
                        setData={setData}
                        onNext={next}
                        onBack={back}
                      />
                    )}
                    {step === 4 && (
                      <MediaStep
                        data={data}
                        setData={setData}
                        onNext={next}
                        onBack={back}
                      />
                    )}
                    {step === 5 && (
                      <ReviewStep
                        data={data}
                        onBack={back}
                        onSubmit={submit}
                        submitting={submitting}
                        submitErr={submitErr}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
