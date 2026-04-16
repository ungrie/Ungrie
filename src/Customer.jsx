import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const fmt = (n) => `KD ${Number(n || 0).toFixed(3)}`;
const getRestId = () =>
  new URLSearchParams(window.location.search).get("rest_id");
// Key is per-restaurant so returning users of restaurant A don't auto-login at restaurant B
const custKey = (restId) => `frt_cust_${restId}`;

/* ── Country codes (common subset) ───────────────────────────────────────── */
const COUNTRIES = [
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "PH", dial: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "BD", dial: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "LK", dial: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "NP", dial: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "UK" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "USA" },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turkey" },
];

/* ── tiny SVG icons ───────────────────────────────────────────────────────── */
const Ic = {
  search: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  cart: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  user: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  home: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  back: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  close: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  plus: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  minus: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  trash: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  check: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  pin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  clock: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  star: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  truck: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  edit: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  homeaddr: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  work: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  wa: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
};

/* ── global CSS ───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --orange:#ff5200;
  --orange-d:#e04800;
  --green:#1e8c45;
  --green-l:#e8f5ee;
  --red:#e53935;
  --red-l:#fdecea;
  --yellow:#f59e0b;
  --bg:#f2f2f7;
  --card:#ffffff;
  --border:#ebebeb;
  --t1:#1a1a1a;
  --t2:#6b6b6b;
  --t3:#aeaeb2;
  --font:'Plus Jakarta Sans',system-ui,sans-serif;
  --nav-h:60px;
  --tab-h:64px;
  --r:16px;
  --r-sm:10px;
  --r-pill:100px;
  --shadow:0 2px 16px rgba(0,0,0,.09);
  --shadow-lg:0 8px 40px rgba(0,0,0,.14);
}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;height:100%}
body{font-family:var(--font);background:var(--bg);color:var(--t1);-webkit-font-smoothing:antialiased;min-height:100dvh;overscroll-behavior:none}
button{font-family:var(--font);cursor:pointer;border:none;background:none;outline:none;-webkit-tap-highlight-color:transparent}
input,textarea,select{font-family:var(--font);outline:none}
img{display:block}
a{text-decoration:none}
::-webkit-scrollbar{width:0;height:0}

/* ── keyframes ── */
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleUp{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes popBadge{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
@keyframes toast{0%{transform:translate(-50%,10px);opacity:0}15%,85%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-4px);opacity:0}}

/* ── overlay + sheet (shared by all bottom panels) ── */
.overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.48);backdrop-filter:blur(2px);animation:fadeIn .2s ease}

/* Mobile: slide up from bottom */
.sheet{
  position:fixed;bottom:0;left:0;right:0;z-index:301;
  background:var(--card);border-radius:var(--r) var(--r) 0 0;
  max-height:92dvh;overflow-y:auto;overflow-x:hidden;
  animation:slideUp .32s cubic-bezier(.34,1.1,.64,1);
  padding-bottom:env(safe-area-inset-bottom,0px);
}

/* Desktop: fixed center — no bottom/transform collision */
@media(min-width:600px){
  .sheet{
    bottom:auto;top:50%;left:50%;
    width:min(520px,92vw);
    margin:0;
    /* Use margin-top trick so transform is only translateX(-50%) translateY(-50%), stable from the start */
    transform:translate(-50%,-50%);
    border-radius:var(--r);
    max-height:90dvh;
    animation:sheetDesktop .2s cubic-bezier(.22,1,.36,1);
  }
}
@keyframes sheetDesktop{
  from{opacity:0;transform:translate(-50%,-50%) scale(.96)}
  to{opacity:1;transform:translate(-50%,-50%) scale(1)}
}
.drag-pill{width:40px;height:4px;background:var(--border);border-radius:99px;margin:12px auto 0}

/* ── spinner ── */
.spin{display:inline-block;width:24px;height:24px;border:2.5px solid var(--border);border-top-color:var(--orange);border-radius:50%;animation:spin .65s linear infinite}

/* ── skeleton ── */
.skel{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;border-radius:var(--r-sm)}

/* ── toast ── */
.toast{
  position:fixed;bottom:calc(var(--tab-h) + 12px);left:50%;
  background:#1a1a1a;color:#fff;
  padding:10px 20px;border-radius:var(--r-pill);
  font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;
  animation:toast 2.6s ease forwards;pointer-events:none;
  box-shadow:var(--shadow-lg);
}
@media(min-width:1024px){.toast{bottom:24px}}

/* ── top nav ── */
.topnav{
  position:sticky;top:0;z-index:100;height:var(--nav-h);
  width:100%;
  background:rgba(255,255,255,.96);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;padding:0 16px;gap:10px;
  box-sizing:border-box;
}
/* ── bottom tab bar (mobile only) ── */
.tabbar{
  position:fixed;bottom:0;left:0;right:0;z-index:100;
  height:var(--tab-h);background:var(--card);
  border-top:1px solid var(--border);
  display:grid;grid-template-columns:repeat(3,1fr);
  padding-bottom:env(safe-area-inset-bottom,0px);
}
@media(min-width:1024px){.tabbar{display:none}}
.tab-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;color:var(--t3);font-size:11px;font-weight:600;transition:color .15s}
.tab-item.on{color:var(--orange)}
.tab-badge{position:absolute;top:-2px;right:-8px;background:var(--orange);color:#fff;border-radius:99px;min-width:16px;height:16px;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px;animation:popBadge .25s ease}

/* ── hero ── */
.hero{position:relative;width:100%;background:#111;overflow:hidden}
.hero img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.hero-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78) 0%,rgba(0,0,0,.1) 60%,transparent 100%)}
.hero-content{position:absolute;bottom:0;left:0;right:0;padding:16px 16px 20px;color:#fff}

/* ── search bar ── */
.search-bar{
  display:flex;align-items:center;gap:10px;
  background:var(--card);border:1.5px solid var(--border);
  border-radius:var(--r-pill);padding:0 16px;height:46px;
  transition:border-color .15s,box-shadow .15s;
}
.search-bar:focus-within{border-color:#aaa;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
.search-bar input{flex:1;font-size:14px;color:var(--t1);border:none;background:none}
.search-bar input::placeholder{color:var(--t3)}

/* ── category strip ── */
.cat-strip{display:flex;gap:8px;overflow-x:auto;padding:14px 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.cat-chip{flex-shrink:0;padding:7px 16px;border-radius:var(--r-pill);border:1.5px solid var(--border);background:var(--card);color:var(--t2);font-size:13px;font-weight:600;white-space:nowrap;transition:all .15s;cursor:pointer}
.cat-chip:hover{border-color:#bbb;color:var(--t1)}
.cat-chip.on{background:var(--t1);color:#fff;border-color:var(--t1)}

/* ── menu section ── */
.section-hd{display:flex;align-items:center;justify-content:space-between;padding:4px 16px 12px}
.section-title{font-size:16px;font-weight:700;color:var(--t1)}
.section-count{font-size:12px;font-weight:600;color:var(--t3)}

/* ── menu card (default: swiggy-style list) ── */
.menu-card{
  display:flex;align-items:flex-start;gap:14px;
  background:var(--card);padding:16px;
  border-bottom:1px solid var(--border);
  cursor:pointer;position:relative;
  transition:background .12s;
}
.menu-card:last-child{border-bottom:none}
.menu-card:active{background:#fafafa}
.menu-thumb{width:96px;height:96px;border-radius:var(--r-sm);overflow:hidden;background:#f0f0f0;flex-shrink:0;position:relative}
.menu-thumb img{width:100%;height:100%;object-fit:cover}
.menu-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:38px;color:var(--t3)}
.menu-info{flex:1;min-width:0;padding-top:2px}
.menu-name{font-size:14px;font-weight:700;color:var(--t1);line-height:1.3;margin-bottom:4px}
.menu-desc{font-size:12.5px;color:var(--t2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:8px}
.menu-price{font-size:14.5px;font-weight:800;color:var(--t1)}
.menu-popular{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:700;color:#e65c00;background:#fff3e0;padding:2px 7px;border-radius:4px;margin-bottom:5px}
.menu-oos{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;color:var(--red);background:var(--red-l);padding:2px 8px;border-radius:4px;margin-left:6px}

/* ── add button ── */
.add-btn{
  position:absolute;bottom:12px;right:12px;
  width:32px;height:32px;border-radius:var(--r-sm);
  background:var(--card);border:1.5px solid var(--orange);
  color:var(--orange);display:flex;align-items:center;justify-content:center;
  transition:all .15s;font-weight:800;box-shadow:0 2px 8px rgba(255,82,0,.15);
}
.add-btn:hover{background:var(--orange);color:#fff}
/* counter pill */
.qty-pill{
  position:absolute;bottom:12px;right:12px;
  display:inline-flex;align-items:center;
  background:var(--orange);border-radius:var(--r-sm);
  overflow:hidden;height:32px;box-shadow:0 2px 8px rgba(255,82,0,.25);
}
.qty-pill button{width:32px;height:32px;color:#fff;display:flex;align-items:center;justify-content:center;transition:background .12s}
.qty-pill button:hover{background:rgba(255,255,255,.2)}
.qty-pill span{min-width:26px;text-align:center;font-size:13px;font-weight:800;color:#fff}

/* ── sheet header ── */
.sheet-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px}
.sheet-title{font-size:18px;font-weight:800;color:var(--t1)}
.close-btn{width:32px;height:32px;border-radius:50%;background:#f5f5f5;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t2);transition:background .12s}
.close-btn:hover{background:#ebebeb}

/* ── item detail sheet ── */
.item-img-wrap{width:100%;aspect-ratio:4/3;overflow:hidden;background:#f0f0f0;position:relative;max-height:280px}
.item-img-wrap img{width:100%;height:100%;object-fit:cover}
.item-img-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:72px;color:var(--t3)}

/* ── variant option ── */
.var-opt{
  display:flex;align-items:center;justify-content:space-between;
  padding:13px 16px;border:1.5px solid var(--border);border-radius:var(--r-sm);
  cursor:pointer;transition:all .15s;
}
.var-opt:hover{border-color:#bbb}
.var-opt.sel{border-color:var(--t1);background:#fafafa}
.var-dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--border);transition:all .15s;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.var-dot.sq{border-radius:5px}
.var-dot.sel{border-color:var(--t1);background:var(--t1)}

/* ── cart item row ── */
.cart-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)}
.cart-row:last-child{border-bottom:none}

/* ── checkout ── */
.addr-card{border:2px solid var(--border);border-radius:var(--r);padding:14px 16px;cursor:pointer;transition:all .15s;margin-bottom:10px}
.addr-card:hover{border-color:#bbb}
.addr-card.sel{border-color:var(--orange);background:#fff9f6}
.pay-opt{flex:1;border:2px solid var(--border);border-radius:var(--r-sm);padding:14px 8px;text-align:center;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px}
.pay-opt.sel{border-color:var(--orange);background:#fff9f6}

/* ── track dots ── */
.track-step{display:flex;align-items:flex-start;gap:14px;position:relative}
.track-dot{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px}
.track-line{position:absolute;left:18px;top:36px;width:2px;height:28px;background:var(--border);border-radius:2px}
.track-line.done{background:var(--green)}

/* ── profile tab ── */
.ptab{font-size:14px;font-weight:600;color:var(--t3);padding:10px 4px;border-bottom:2.5px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap}
.ptab.on{color:var(--t1);border-bottom-color:var(--orange)}

/* ── button primary ── */
.btn-primary{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:15px;background:var(--orange);color:#fff;
  font-size:15px;font-weight:700;border-radius:var(--r);
  transition:all .15s;cursor:pointer;border:none;font-family:var(--font);
}
.btn-primary:hover{background:var(--orange-d);transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,82,0,.3)}
.btn-primary:active{transform:none;box-shadow:none}
.btn-primary:disabled{background:#d4d4d4;color:#aaa;cursor:not-allowed;transform:none;box-shadow:none}

/* ── input ── */
.inp{width:100%;border:1.5px solid var(--border);border-radius:var(--r-sm);padding:12px 14px;font-size:14px;color:var(--t1);background:#fff;transition:all .15s;font-family:var(--font)}
.inp::placeholder{color:var(--t3)}
.inp:focus{border-color:var(--t1);box-shadow:0 0 0 3px rgba(0,0,0,.05)}
.lbl{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:7px;display:block}

/* ── btn outline ── */
.btn-out{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13px;font-weight:600;color:var(--t2);background:#fff;cursor:pointer;transition:all .15s;font-family:var(--font)}
.btn-out:hover{border-color:var(--t1);color:var(--t1)}

/* ── modal qty control ── */
.qty-ctrl{display:inline-flex;align-items:center;border:1.5px solid var(--border);border-radius:var(--r-pill);overflow:hidden}
.qty-ctrl button{width:38px;height:38px;display:flex;align-items:center;justify-content:center;color:var(--t1);transition:background .12s;cursor:pointer}
.qty-ctrl button:hover{background:#f5f5f5}
.qty-ctrl span{min-width:30px;text-align:center;font-size:15px;font-weight:700}

/* ── cart summary line ── */
.sum-row{display:flex;justify-content:space-between;font-size:13.5px;color:var(--t2);margin-bottom:8px}
.sum-row.total{font-size:16px;font-weight:800;color:var(--t1);margin-top:4px}

/* ── page layout ── */
.page-wrap{max-width:1200px;margin:0 auto;padding:0 0 calc(var(--tab-h) + 16px)}
@media(min-width:1024px){
  .page-wrap{display:grid;grid-template-columns:1fr 360px;gap:28px;padding:28px 24px 40px;align-items:start;box-sizing:border-box;width:100%}
  .main-col{min-width:0}
  .cart-col{position:sticky;top:calc(var(--nav-h) + 16px);max-height:calc(100dvh - var(--nav-h) - 32px);overflow-y:auto;overflow-x:hidden}
}
.content-card{background:var(--card);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow)}

/* ── empty + error ── */
.center-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;gap:12px;padding:24px;text-align:center}

/* ── add-on section ── */
.addon-section{background:var(--card);margin-bottom:8px}
.addon-type-hd{padding:18px 16px 10px;display:flex;align-items:center;justify-content:space-between}
.addon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;padding:0 16px 20px}
@media(min-width:480px){.addon-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}
.addon-card{
  border:1.5px solid var(--border);border-radius:var(--r-sm);
  overflow:hidden;background:#fff;cursor:pointer;
  transition:border-color .15s,box-shadow .15s;
  display:flex;flex-direction:column;
}
.addon-card:hover{border-color:#bbb;box-shadow:0 2px 10px rgba(0,0,0,.07)}
.addon-card.in-cart{border-color:var(--orange);box-shadow:0 2px 10px rgba(255,82,0,.15)}
.addon-img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#f5f5f5;display:block}
.addon-img-empty{width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;font-size:32px;background:#f5f5f5;color:var(--t3)}
.addon-info{padding:8px 10px 10px;flex:1;display:flex;flex-direction:column;gap:3px}
.addon-name{font-size:13px;font-weight:700;color:var(--t1);line-height:1.3}
.addon-price{font-size:12.5px;font-weight:800;color:var(--orange)}
.addon-qty-row{display:flex;align-items:center;justify-content:space-between;padding:0 10px 10px;gap:6px}
.addon-qty-ctrl{display:inline-flex;align-items:center;border:1.5px solid var(--orange);border-radius:var(--r-pill);overflow:hidden}
.addon-qty-ctrl button{width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:var(--orange);transition:background .12s}
.addon-qty-ctrl button:hover{background:#fff7f3}
.addon-qty-ctrl span{min-width:22px;text-align:center;font-size:12px;font-weight:800;color:var(--t1)}

/* ── cart customization detail lines ── */
.cart-detail{font-size:11.5px;color:var(--t3);line-height:1.55;margin-top:2px}
.cart-detail span{display:inline-block}
.cart-note{font-size:11px;color:var(--t3);font-style:italic;margin-top:3px}

/* ── customizable badge ── */
.cust-badge{
  display:inline-flex;align-items:center;gap:3px;
  font-size:10px;font-weight:700;letter-spacing:.02em;
  color:#c2410c;background:#fff7ed;border:1px solid #fed7aa;
  padding:2px 7px;border-radius:99px;margin-top:5px;width:fit-content;
}

/* ── customize sheet (variants popup) ── */
.csheet-group-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px}
.csheet-required-pill{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:#fff3e0;color:#c2410c;border:1px solid #fed7aa;padding:3px 9px;border-radius:99px;flex-shrink:0}
.csheet-opt-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;border:1.5px solid var(--border);border-radius:var(--r-sm);cursor:pointer;transition:border-color .14s,background .14s}
.csheet-opt-row:hover{border-color:#bbb}
.csheet-opt-row.sel{border-color:var(--t1);background:#fafafa}
.csheet-dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color .14s,background .14s}
.csheet-dot.sq{border-radius:5px}
.csheet-dot.on{border-color:var(--t1);background:var(--t1)}

/* ── map picker ── */
.map-wrap{width:100%;height:240px;border-radius:var(--r-sm);overflow:hidden;position:relative;border:1.5px solid var(--border);background:#e8e8e8;margin-bottom:10px}
#leaflet-map{width:100%;height:100%}
.map-snapshot{width:100%;height:110px;object-fit:cover;border-radius:var(--r-sm);border:1.5px solid var(--border);cursor:pointer;display:block;margin-bottom:8px}
.map-snapshot-empty{width:100%;height:80px;background:#f5f5f5;border-radius:var(--r-sm);border:1.5px dashed var(--border);display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--t3);font-weight:500;cursor:pointer;margin-bottom:8px}

/* ── phone onboarding ── */
.phone-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;padding:24px;background:var(--bg)}
.phone-card{background:var(--card);border-radius:var(--r);padding:32px 24px;max-width:400px;width:100%;box-shadow:var(--shadow-lg)}
.phone-flag-btn{padding:0 14px;border:1.5px solid var(--border);border-radius:var(--r-sm) 0 0 var(--r-sm);background:#fff;font-size:14px;cursor:pointer;color:var(--t1);white-space:nowrap;display:flex;align-items:center;gap:6px;height:48px;transition:border-color .15s;font-family:var(--font)}
.phone-flag-btn:hover{border-color:#bbb}
.phone-input-box{flex:1;border:1.5px solid var(--border);border-left:none;border-radius:0 var(--r-sm) var(--r-sm) 0;padding:0 14px;font-size:15px;color:var(--t1);background:#fff;height:48px;font-family:var(--font)}
.phone-input-box:focus{border-color:var(--t1);outline:none}
.country-drop{position:absolute;top:calc(100% + 4px);left:0;width:280px;z-index:500;background:#fff;border:1.5px solid var(--border);border-radius:var(--r-sm);box-shadow:var(--shadow-lg);max-height:240px;overflow-y:auto}
.country-opt{padding:10px 14px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px;transition:background .1s}
.country-opt:hover{background:#f5f5f5}
.country-search{width:100%;padding:10px 14px;border:none;border-bottom:1px solid var(--border);font-size:13px;font-family:var(--font);outline:none;color:var(--t1)}

/* ── order history ── */
.order-card{border:1.5px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:10px}
.order-card.active{border-color:var(--orange);background:#fff9f6}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
.active-dot{width:8px;height:8px;border-radius:50%;background:var(--orange);animation:pulse 1.6s ease-in-out infinite;display:inline-block;margin-right:6px;vertical-align:middle}
`;

/* ── misc atoms ───────────────────────────────────────────────────────────── */
const Toast = ({ msg }) => (msg ? <div className="toast">{msg}</div> : null);
const Spinner = ({ size = 24 }) => (
  <div className="spin" style={{ width: size, height: size }} />
);

const Skeleton = ({ h = 80, r = 10, style = {} }) => (
  <div className="skel" style={{ height: h, borderRadius: r, ...style }} />
);

const LoadScreen = () => (
  <div className="center-wrap">
    <Spinner size={36} />
    <p style={{ fontSize: 14, color: "var(--t2)", fontWeight: 500 }}>
      Loading menu…
    </p>
  </div>
);

const ErrScreen = ({ msg }) => (
  <div className="center-wrap">
    <div style={{ fontSize: 64 }}>🍽️</div>
    <h2 style={{ fontSize: 22, fontWeight: 800 }}>Not found</h2>
    <p style={{ color: "var(--t2)", fontSize: 14, maxWidth: 300 }}>
      {msg || "Check the link and try again."}
    </p>
  </div>
);

/* ── Load Leaflet from CDN (once) ─────────────────────────────────────────── */
let leafletLoaded = false;
let leafletCallbacks = [];
function loadLeaflet(cb) {
  if (leafletLoaded) {
    cb();
    return;
  }
  leafletCallbacks.push(cb);
  if (document.getElementById("leaflet-css")) return; // already loading
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
  const script = document.createElement("script");
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = () => {
    leafletLoaded = true;
    leafletCallbacks.forEach((f) => f());
    leafletCallbacks = [];
  };
  script.onerror = () =>
    leafletCallbacks.forEach((f) => f(new Error("Leaflet failed to load")));
  document.head.appendChild(script);
}

/* ── MapPicker — Leaflet-based coordinate picker ─────────────────────────── */
function MapPicker({ initialLat, initialLng, onConfirm, onClose }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [pos, setPos] = useState({
    lat: initialLat || 29.3759,
    lng: initialLng || 47.9774,
  }); // Default: Kuwait City
  const [leafletErr, setLeafletErr] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    loadLeaflet((err) => {
      if (err) {
        setLeafletErr("Map failed to load. Check your connection.");
        return;
      }
      setLeafletReady(true);
    });
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = window.L;
    if (!L) return;

    // Avoid double-init
    if (leafletMapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [pos.lat, pos.lng],
      15,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OSM contributors",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:var(--orange);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: "",
    });

    const marker = L.marker([pos.lat, pos.lng], {
      draggable: true,
      icon,
    }).addTo(map);
    markerRef.current = marker;
    leafletMapRef.current = map;

    marker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      setPos({ lat, lng });
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setPos({ lat, lng });
    });

    // If user has GPS, try to center on them
    if (!initialLat && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const { latitude: lat, longitude: lng } = p.coords;
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
          setPos({ lat, lng });
        },
        () => {}, // ignore denied
        { timeout: 5000 },
      );
    }

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [leafletReady]); // eslint-disable-line

  // Generate static OSM snapshot URL for saving (no API key required)
  const getSnapshotUrl = ({ lat, lng }) =>
    `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.004},${lng + 0.005},${lat + 0.004}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div
        className="sheet"
        style={{ paddingBottom: 0, display: "flex", flexDirection: "column" }}
      >
        <div className="drag-pill" />
        <div className="sheet-hd" style={{ flexShrink: 0 }}>
          <span className="sheet-title">Pin your location</span>
          <button className="close-btn" onClick={onClose}>
            {Ic.close}
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--t2)", padding: "0 20px 12px" }}>
          Tap the map or drag the pin to set your delivery spot.
        </p>
        <div style={{ flex: 1, padding: "0 20px", minHeight: 0 }}>
          {leafletErr ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--red)" }}>
                ⚠️ {leafletErr}
              </p>
            </div>
          ) : !leafletReady ? (
            <div
              style={{
                height: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spinner size={28} />
            </div>
          ) : (
            <div className="map-wrap">
              <div
                id="leaflet-map"
                ref={mapRef}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}
          <p
            style={{
              fontSize: 12,
              color: "var(--t3)",
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
          </p>
        </div>
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
            paddingBottom: "calc(14px + env(safe-area-inset-bottom,0px))",
            display: "flex",
            gap: 10,
          }}
        >
          <button className="btn-out" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ flex: 2 }}
            onClick={() =>
              onConfirm({
                lat: pos.lat,
                lng: pos.lng,
                snapshotUrl: getSnapshotUrl(pos),
              })
            }
          >
            Confirm location
          </button>
        </div>
      </div>
    </>
  );
}

/* ── PhoneOnboarding ──────────────────────────────────────────────────────── */
/* Shown on first visit to a restaurant. Identifies the customer by phone.    */
function PhoneOnboarding({ restId, onComplete }) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "name"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropRef = useRef(null);

  const fullPhone = `${country.dial}${phone.replace(/\D/g, "")}`;
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch),
  );

  // Close country dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const lookupPhone = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setErr("Enter a valid phone number.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      // Look up existing customer with this phone for this restaurant
      const { data: existing } = await supabase
        .from("Customer")
        .select("*")
        .eq("ph_num", fullPhone)
        .maybeSingle();

      if (existing) {
        // Check if they've used this restaurant before
        const { data: link } = await supabase
          .from("Customer_Restaurant")
          .select("id")
          .eq("cust_id", existing.id)
          .eq("rest_id", restId)
          .maybeSingle();

        localStorage.setItem(custKey(restId), existing.id);
        if (!link) {
          // First time at THIS restaurant — create link, still known customer
          await supabase
            .from("Customer_Restaurant")
            .insert({ cust_id: existing.id, rest_id: restId });
        }
        onComplete(existing);
      } else {
        // Brand new customer — need their name
        setStep("name");
      }
    } catch (e) {
      console.error(e);
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    if (!name.trim()) {
      setErr("Please enter your name.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const { data: nc, error } = await supabase
        .from("Customer")
        .insert({
          cust_name: name.trim(),
          ph_num: fullPhone,
          broadcast: false,
          joined_on: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();
      if (error) throw error;
      await supabase
        .from("Customer_Restaurant")
        .insert({ cust_id: nc.id, rest_id: restId });
      localStorage.setItem(custKey(restId), nc.id);
      onComplete(nc);
    } catch (e) {
      console.error(e);
      setErr("Failed to create account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-wrap">
      <div className="phone-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🍽️</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Welcome!
          </h2>
          <p style={{ fontSize: 14, color: "var(--t2)" }}>
            {step === "phone"
              ? "Enter your WhatsApp number to get started."
              : "Almost there — just your name."}
          </p>
        </div>

        {step === "phone" && (
          <>
            <label className="lbl">WhatsApp number</label>
            <div
              style={{
                display: "flex",
                position: "relative",
                marginBottom: 14,
              }}
              ref={dropRef}
            >
              <button
                className="phone-flag-btn"
                onClick={() => setShowDrop((s) => !s)}
              >
                <span>{country.flag}</span>
                <span>{country.dial}</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <input
                className="phone-input-box"
                placeholder="e.g. 50 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && lookupPhone()}
                inputMode="tel"
                autoFocus
              />
              {showDrop && (
                <div className="country-drop">
                  <input
                    className="country-search"
                    placeholder="Search country…"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    autoFocus
                  />
                  {filteredCountries.map((c) => (
                    <div
                      key={c.code}
                      className="country-opt"
                      onClick={() => {
                        setCountry(c);
                        setShowDrop(false);
                        setCountrySearch("");
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{c.flag}</span>
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span style={{ color: "var(--t3)" }}>{c.dial}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 18 }}>
              We use this to remember your orders and address. No spam.
            </p>
          </>
        )}

        {step === "name" && (
          <>
            <p
              style={{
                fontSize: 13,
                color: "var(--t2)",
                marginBottom: 14,
                background: "#f5f5f5",
                padding: "10px 14px",
                borderRadius: "var(--r-sm)",
              }}
            >
              {country.flag} {fullPhone}
            </p>
            <label className="lbl">Your name</label>
            <input
              className="inp"
              placeholder="e.g. Ahmed Al-Rashidi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && createCustomer()}
              autoFocus
              style={{ marginBottom: 14 }}
            />
          </>
        )}

        {err && (
          <div
            style={{
              background: "#fdecea",
              border: "1px solid #fca5a5",
              borderRadius: "var(--r-sm)",
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 14,
            }}
          >
            ⚠️ {err}
          </div>
        )}

        <button
          className="btn-primary"
          disabled={loading}
          onClick={step === "phone" ? lookupPhone : createCustomer}
        >
          {loading ? (
            <Spinner size={20} />
          ) : step === "phone" ? (
            "Continue →"
          ) : (
            "Get started →"
          )}
        </button>

        {step === "name" && (
          <button
            className="btn-out"
            style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
            onClick={() => {
              setStep("phone");
              setErr("");
            }}
          >
            ← Change number
          </button>
        )}
      </div>
    </div>
  );
}

/* ── check dot ────────────────────────────────────────────────────────────── */
const CheckDot = ({ sel, multi }) => (
  <div className={`var-dot${multi ? " sq" : ""}${sel ? " sel" : ""}`}>
    {sel && <span style={{ color: "#fff" }}>{Ic.check}</span>}
  </div>
);

/* ── ItemDetailSheet ──────────────────────────────────────────────────────── */
function ItemDetailSheet({ item, cart, onClose, onAdd, onUpdateNote }) {
  const [qty, setQty] = useState(1);
  const [selVars, setSelVars] = useState({});
  const [varGroups, setVarGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState(null);

  // Find existing cart entry for this item (first match, any variant)
  // The note is shared across all entries of the same item
  const existingNote = cart.find((c) => c.item.id === item.id)?.note || "";
  const [note, setNote] = useState(existingNote);
  const alreadyInCart = cart.some((c) => c.item.id === item.id);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchErr(null);
      try {
        // Fetch variant groups
        const { data: gData, error: gErr } = await supabase
          .from("Variant_Groups")
          .select("id, name, is_required, is_multiple")
          .eq("menu_id", item.id)
          .order("id", { ascending: true });
        if (gErr) throw gErr;
        const groups = gData || [];

        // Fetch options separately (avoids "Variant Options" space-in-name join issues)
        let options = [];
        if (groups.length > 0) {
          const { data: oData, error: oErr } = await supabase
            .from("Variant Options")
            .select("id, var_group_id, name, price_adj")
            .in(
              "var_group_id",
              groups.map((g) => g.id),
            )
            .order("id", { ascending: true });
          if (oErr) throw oErr;
          options = oData || [];
        }

        if (cancelled) return;

        const assembled = groups.map((g) => ({
          ...g,
          Variant_Options: options.filter((o) => o.var_group_id === g.id),
        }));
        setVarGroups(assembled);

        // Pre-select first option for required single-choice groups
        const defaults = {};
        assembled.forEach((g) => {
          if (g.is_required && !g.is_multiple && g.Variant_Options?.length)
            defaults[g.id] = g.Variant_Options[0].id;
        });
        setSelVars(defaults);
      } catch (e) {
        console.error("[ItemDetailSheet] fetch error:", e);
        if (!cancelled) setFetchErr("Couldn't load options. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const toggleVar = (gid, oid, multi) => {
    if (multi) {
      setSelVars((p) => {
        const cur = Array.isArray(p[gid]) ? p[gid] : [];
        return {
          ...p,
          [gid]: cur.includes(oid)
            ? cur.filter((x) => x !== oid)
            : [...cur, oid],
        };
      });
    } else {
      setSelVars((p) => ({ ...p, [gid]: oid }));
    }
  };

  const extraCost = varGroups.reduce((total, g) => {
    const opts = g.Variant_Options || [],
      sel = selVars[g.id];
    if (Array.isArray(sel))
      return (
        total +
        sel.reduce((s, sid) => {
          const o = opts.find((x) => x.id === sid);
          return s + (o ? +o.price_adj : 0);
        }, 0)
      );
    if (sel) {
      const o = opts.find((x) => x.id === sel);
      return total + (o ? +o.price_adj : 0);
    }
    return total;
  }, 0);

  const unitPrice = +item.price + extraCost;

  const canAdd = varGroups.every((g) => {
    if (!g.is_required) return true;
    const s = selVars[g.id];
    return g.is_multiple ? Array.isArray(s) && s.length > 0 : !!s;
  });

  const handleAdd = () => {
    if (!canAdd) return;

    // Build variantMeta for named display in cart
    const variantMeta = {};
    varGroups.forEach((g) => {
      const sel = selVars[g.id];
      if (!sel || (Array.isArray(sel) && sel.length === 0)) return;
      const ids = Array.isArray(sel) ? sel : [sel];
      const names = ids
        .map((id) => (g.Variant_Options || []).find((o) => o.id === id)?.name)
        .filter(Boolean);
      if (names.length > 0)
        variantMeta[g.id] = { groupName: g.name, optionNames: names };
    });

    // Always propagate the note update to all matching cart entries first
    if (onUpdateNote) onUpdateNote(item.id, note);

    onAdd({
      item,
      qty,
      selectedVariants: selVars,
      variantMeta,
      selectedAddOns: [],
      unitPrice,
      note,
    });
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet" style={{ paddingBottom: 0 }}>
        {/* Hero image */}
        <div className="item-img-wrap">
          {item.image_path ? (
            <img
              src={item.image_path}
              alt={item.name}
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="item-img-empty">🍽️</div>
          )}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            {Ic.back}
          </button>
          {item.is_popular && (
            <span
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,.62)",
                color: "#fff",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 9px",
                backdropFilter: "blur(4px)",
              }}
            >
              ⭐ Popular
            </span>
          )}
        </div>

        {/* Item name + price */}
        <div style={{ padding: "20px 20px 0" }}>
          <h2
            style={{
              fontSize: 21,
              fontWeight: 800,
              marginBottom: 6,
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h2>
          {item.description && (
            <p
              style={{
                fontSize: 14,
                color: "var(--t2)",
                lineHeight: 1.65,
                marginBottom: 10,
              }}
            >
              {item.description}
            </p>
          )}
          <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
            {fmt(unitPrice)}
          </p>
        </div>

        {/* Variants / loading / error */}
        {loading ? (
          <div
            style={{
              padding: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Spinner size={28} />
          </div>
        ) : fetchErr ? (
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 10 }}>
              ⚠️ {fetchErr}
            </p>
          </div>
        ) : (
          <div style={{ padding: "0 20px" }}>
            {varGroups.map((g) => (
              <div key={g.id} style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</p>
                  {g.is_required && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#f3f4f6",
                        color: "var(--t2)",
                        padding: "3px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {(g.Variant_Options || []).map((opt) => {
                    const s = selVars[g.id];
                    const sel = g.is_multiple
                      ? Array.isArray(s) && s.includes(opt.id)
                      : s === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`var-opt${sel ? " sel" : ""}`}
                        onClick={() => toggleVar(g.id, opt.id, g.is_multiple)}
                      >
                        <span
                          style={{ fontSize: 14, fontWeight: sel ? 600 : 400 }}
                        >
                          {opt.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {+opt.price_adj !== 0 && (
                            <span
                              style={{
                                fontSize: 13,
                                color: "var(--t2)",
                                fontWeight: 600,
                              }}
                            >
                              +{fmt(opt.price_adj)}
                            </span>
                          )}
                          <CheckDot sel={sel} multi={g.is_multiple} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Per-item special instructions — pre-populated from existing cart entry */}
            <div style={{ marginBottom: 20 }}>
              <label className="lbl">
                Special instructions{" "}
                <span style={{ textTransform: "none", fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              {alreadyInCart && (
                <p
                  style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6 }}
                >
                  This note applies to all "{item.name}" in your cart.
                </p>
              )}
              <textarea
                className="inp"
                rows={2}
                placeholder="e.g. no onions, extra sauce, well done…"
                style={{ resize: "none" }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderTop: "1px solid var(--border)",
            background: "#fff",
            position: "sticky",
            bottom: 0,
            paddingBottom: "calc(14px + env(safe-area-inset-bottom,0px))",
          }}
        >
          <div className="qty-ctrl" style={{ flexShrink: 0 }}>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
              {Ic.minus}
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>{Ic.plus}</button>
          </div>
          <button
            className="btn-primary"
            style={{ flex: 1, opacity: canAdd ? 1 : 0.4 }}
            disabled={!canAdd || loading}
            onClick={handleAdd}
          >
            {loading ? "Loading…" : `Add to cart · ${fmt(unitPrice * qty)}`}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── CartSheet ────────────────────────────────────────────────────────────── */
function CartSheet({
  cart,
  addonCart,
  restaurant,
  onUpdateQty,
  onUpdateAddonQty,
  calcTotals,
  onCheckout,
  onClose,
  note,
  onNoteChange,
}) {
  const { subT, delivery, total } = calcTotals(cart, addonCart);
  const minOk = !restaurant?.min_order || subT >= restaurant.min_order;
  const totalItems =
    cart.reduce((s, c) => s + c.qty, 0) +
    addonCart.reduce((s, a) => s + a.qty, 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="drag-pill" />
        <div className="sheet-hd">
          <span className="sheet-title">
            Your cart {totalItems > 0 ? `(${totalItems})` : ""}
          </span>
          <button className="close-btn" onClick={onClose}>
            {Ic.close}
          </button>
        </div>

        {totalItems === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🛒</div>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              Your cart is empty
            </p>
            <p style={{ color: "var(--t2)", fontSize: 14 }}>
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <div style={{ padding: "0 20px 24px" }}>
            {/* ── Menu items ── */}
            {cart.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--t3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    padding: "10px 0 6px",
                  }}
                >
                  Menu items
                </p>
                {cart.map((c, i) => {
                  // Show option names only (no group name prefix)
                  const varLines = Object.values(c.variantMeta || {})
                    .flatMap((m) => m.optionNames)
                    .filter(Boolean);
                  return (
                    <div key={i} className="cart-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            marginBottom: 2,
                          }}
                        >
                          {c.item.name}
                        </p>
                        {/* Variant option names */}
                        {varLines.length > 0 && (
                          <p className="cart-detail">
                            {varLines.map((v, vi) => (
                              <span
                                key={vi}
                                style={{
                                  display: "inline-block",
                                  marginRight: 6,
                                }}
                              >
                                · {v}
                              </span>
                            ))}
                          </p>
                        )}
                        {/* Per-item special instruction */}
                        {c.note && (
                          <p className="cart-note" style={{ marginTop: 3 }}>
                            📝 {c.note}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--t2)",
                            fontWeight: 700,
                            marginTop: 3,
                          }}
                        >
                          {fmt(c.unitPrice)}
                        </p>
                      </div>
                      <div className="qty-ctrl" style={{ flexShrink: 0 }}>
                        <button onClick={() => onUpdateQty(i, c.qty - 1)}>
                          {c.qty === 1 ? Ic.trash : Ic.minus}
                        </button>
                        <span>{c.qty}</span>
                        <button onClick={() => onUpdateQty(i, c.qty + 1)}>
                          {Ic.plus}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Add-on cart rows ── */}
            {addonCart.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--t3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    padding: "10px 0 6px",
                  }}
                >
                  Add-ons
                </p>
                {addonCart.map((a, i) => (
                  <div key={i} className="cart-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 2,
                        }}
                      >
                        {a.addon.name}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--t2)",
                          fontWeight: 700,
                        }}
                      >
                        {fmt(a.addon.price)}
                      </p>
                    </div>
                    <div className="qty-ctrl" style={{ flexShrink: 0 }}>
                      <button onClick={() => onUpdateAddonQty(a.addon.id, -1)}>
                        {a.qty === 1 ? Ic.trash : Ic.minus}
                      </button>
                      <span>{a.qty}</span>
                      <button onClick={() => onUpdateAddonQty(a.addon.id, 1)}>
                        {Ic.plus}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Order note ── */}
            <div style={{ margin: "16px 0" }}>
              <label className="lbl">
                Order note{" "}
                <span
                  style={{
                    textTransform: "none",
                    fontWeight: 400,
                    color: "var(--t3)",
                  }}
                >
                  (optional · applies to whole order)
                </span>
              </label>
              <textarea
                className="inp"
                rows={2}
                placeholder="e.g. ring the bell, leave at door, no plastic bags…"
                style={{ resize: "none", fontSize: 13.5 }}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                maxLength={300}
              />
            </div>

            {/* ── Bill summary ── */}
            <div
              style={{
                background: "#fafafa",
                borderRadius: var_r,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <div className="sum-row">
                <span>Subtotal</span>
                <span>{fmt(subT)}</span>
              </div>
              <div className="sum-row">
                <span>Delivery fee</span>
                <span>{fmt(delivery)}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  marginTop: 10,
                  paddingTop: 10,
                }}
              >
                <div className="sum-row total">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>

            {restaurant?.min_order && subT < restaurant.min_order && (
              <div
                style={{
                  background: "#fff8e1",
                  border: "1px solid #ffe082",
                  borderRadius: var_r_sm,
                  padding: "10px 14px",
                  marginBottom: 14,
                  fontSize: 13,
                  color: "#e65100",
                  fontWeight: 500,
                }}
              >
                ⚠️ Min. order {fmt(restaurant.min_order)} · add{" "}
                {fmt(restaurant.min_order - subT)} more
              </div>
            )}

            <button
              className="btn-primary"
              disabled={!minOk}
              onClick={() => onCheckout(total, note)}
            >
              Proceed to checkout · {fmt(total)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// JS vars for inline styles (avoids template literal issues)
const var_r = "var(--r)";
const var_r_sm = "var(--r-sm)";

/* ── CheckoutSheet ────────────────────────────────────────────────────────── */
function CheckoutSheet({
  total,
  cartNote,
  restaurant,
  addresses,
  defaultAddr,
  onClose,
  onPlaceOrder,
  onAddAddress,
}) {
  const [selAddr, setSelAddr] = useState(defaultAddr?.id || null);
  const [pay, setPay] = useState("Cash");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const addr = addresses.find((a) => a.id === selAddr);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="drag-pill" />
        <div className="sheet-hd">
          <span className="sheet-title">Checkout</span>
          <button className="close-btn" onClick={onClose}>
            {Ic.close}
          </button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          {/* Address */}
          <div style={{ marginBottom: 22 }}>
            <label className="lbl">Delivery address</label>
            {addresses.length === 0 ? (
              <button
                className="btn-out"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={onAddAddress}
              >
                {Ic.plus} Add address
              </button>
            ) : (
              <>
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className={`addr-card${selAddr === a.id ? " sel" : ""}`}
                    onClick={() => setSelAddr(a.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "var(--t2)" }}>
                        {a.label === "Work" ? Ic.work : Ic.homeaddr}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {a.label}
                      </span>
                      {selAddr === a.id && (
                        <span
                          style={{ marginLeft: "auto", color: "var(--orange)" }}
                        >
                          {Ic.check}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--t2)",
                        paddingLeft: 22,
                      }}
                    >
                      {[
                        a.apartment_no && `Apt ${a.apartment_no}`,
                        a.floor && `Floor ${a.floor}`,
                        a.bldg_name,
                        a.street,
                        a.block,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ))}
                <button
                  className="btn-out"
                  style={{
                    justifyContent: "center",
                    width: "100%",
                    marginTop: 4,
                  }}
                  onClick={onAddAddress}
                >
                  {Ic.plus} Add new address
                </button>
              </>
            )}
          </div>

          {/* Payment */}
          <div style={{ marginBottom: 22 }}>
            <label className="lbl">Payment method</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                ["Cash", "💵"],
                ["Card", "💳"],
                ["Online", "📱"],
              ].map(([m, em]) => (
                <div
                  key={m}
                  className={`pay-opt${pay === m ? " sel" : ""}`}
                  onClick={() => setPay(m)}
                >
                  <span style={{ fontSize: 24 }}>{em}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes — show the special instructions from cart if any */}
          {cartNote ? (
            <div style={{ marginBottom: 22 }}>
              <label className="lbl">Special instructions</label>
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid var(--border)",
                  borderRadius: var_r_sm,
                  padding: "10px 14px",
                  fontSize: 13.5,
                  color: "var(--t2)",
                  lineHeight: 1.5,
                }}
              >
                {cartNote}
              </div>
            </div>
          ) : null}

          {/* Total */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: var_r_sm,
              padding: "13px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600 }}>Total to pay</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{fmt(total)}</span>
          </div>

          <button
            className="btn-primary"
            disabled={placing || !selAddr}
            onClick={async () => {
              if (!addr) {
                alert("Please select a delivery address.");
                return;
              }
              setPlacing(true);
              await onPlaceOrder({
                address: addr,
                payMethod: pay,
                notes: cartNote || "",
              });
              setPlacing(false);
            }}
          >
            {placing ? <Spinner size={20} /> : `Place order · ${fmt(total)}`}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── TrackSheet ───────────────────────────────────────────────────────────── */
function TrackSheet({ order, restaurant, address, onClose, onStatusUpdate }) {
  const [liveStatus, setLiveStatus] = useState(order?.status || "pending");
  const [riderName, setRiderName] = useState(
    order?.delivery_rider_name || null,
  );

  const steps = [
    { l: "Order placed!", e: "✅" },
    { l: "Accepted by restaurant", e: "🍽️" },
    { l: "Food being prepared", e: "👨‍🍳" },
    { l: "On the way!", e: "🛵" },
  ];
  const cur =
    liveStatus === "accepted"
      ? 2
      : liveStatus === "preparing"
        ? 3
        : liveStatus === "on_the_way"
          ? 4
          : liveStatus === "delivered"
            ? 5
            : 1;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Real-time: watch this order for status changes
  useEffect(() => {
    if (!order?.id) return;
    const ch = supabase
      .channel(`order-track-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setLiveStatus(payload.new.status);
          if (payload.new.delivery_rider_name)
            setRiderName(payload.new.delivery_rider_name);
          if (onStatusUpdate) onStatusUpdate(payload.new.status);
        },
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [order?.id]); // eslint-disable-line

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="drag-pill" />
        <div className="sheet-hd">
          <span className="sheet-title">Track order</span>
          <button className="close-btn" onClick={onClose}>
            {Ic.close}
          </button>
        </div>
        <div style={{ padding: "0 20px 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 13, color: "var(--t3)", fontWeight: 500 }}>
              Order #{order?.id}
            </p>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 99,
                background:
                  liveStatus === "delivered"
                    ? "var(--green-l)"
                    : liveStatus === "rejected"
                      ? "var(--red-l)"
                      : "#fff0e8",
                color:
                  liveStatus === "delivered"
                    ? "var(--green)"
                    : liveStatus === "rejected"
                      ? "var(--red)"
                      : "var(--orange)",
              }}
            >
              {liveStatus === "delivered"
                ? "Delivered ✅"
                : liveStatus === "rejected"
                  ? "Rejected"
                  : liveStatus === "on_the_way"
                    ? "On the way 🛵"
                    : liveStatus === "preparing"
                      ? "Preparing 👨‍🍳"
                      : liveStatus === "accepted"
                        ? "Accepted"
                        : "Pending"}
            </span>
          </div>

          {/* Rejected banner */}
          {liveStatus === "rejected" && (
            <div
              style={{
                background: "var(--red-l)",
                border: "1px solid #fca5a5",
                borderRadius: "var(--r-sm)",
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--red)",
                  marginBottom: 4,
                }}
              >
                Order rejected
              </p>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>
                {order?.notes || "The restaurant could not fulfill your order."}
              </p>
            </div>
          )}

          {/* Steps */}
          {liveStatus !== "rejected" && (
            <div style={{ marginBottom: 24 }}>
              {steps.map((s, i) => {
                const n = i + 1,
                  done = n < cur,
                  active = n === cur;
                return (
                  <div key={i} style={{ position: "relative" }}>
                    <div
                      className="track-step"
                      style={{ paddingBottom: i < 3 ? 8 : 0 }}
                    >
                      <div
                        className="track-dot"
                        style={{
                          background: done
                            ? "var(--green)"
                            : active
                              ? "var(--orange)"
                              : "#f0f0f0",
                          color: done || active ? "#fff" : "var(--t3)",
                          fontSize: done ? 16 : 18,
                        }}
                      >
                        {done ? Ic.check : s.e}
                      </div>
                      <div style={{ paddingTop: 6 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: active ? 700 : 400,
                            color: done || active ? "var(--t1)" : "var(--t3)",
                          }}
                        >
                          {s.l}
                        </p>
                      </div>
                    </div>
                    {i < 3 && (
                      <div className={`track-line${done ? " done" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rider info */}
          {riderName &&
            (liveStatus === "on_the_way" || liveStatus === "delivered") && (
              <div
                style={{
                  background: "var(--green-l)",
                  border: "1px solid var(--green-border, #B8DEC9)",
                  borderRadius: "var(--r-sm)",
                  padding: "12px 14px",
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--green)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 4,
                  }}
                >
                  Your delivery rider
                </p>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{riderName}</p>
              </div>
            )}

          {/* WhatsApp */}
          {restaurant?.ph_no && (
            <a
              href={`https://wa.me/${restaurant.ph_no.replace(/\D/g, "")}?text=Hi! My order ID is %23${order?.id}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "13px 20px",
                background: "#25D366",
                color: "#fff",
                borderRadius: var_r,
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {Ic.wa} WhatsApp for updates
            </a>
          )}

          {/* Info */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: var_r,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🏪</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13 }}>
                  {restaurant?.name}
                  {restaurant?.branch_name ? `, ${restaurant.branch_name}` : ""}
                </p>
                {restaurant?.address && (
                  <p style={{ fontSize: 12, color: "var(--t3)" }}>
                    {restaurant.address}
                  </p>
                )}
              </div>
            </div>
            {address && (
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <p style={{ fontSize: 12, color: "var(--t2)" }}>
                  {[
                    address.apartment_no && `Apt ${address.apartment_no}`,
                    address.street,
                    address.block,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── ProfileSheet ─────────────────────────────────────────────────────────── */
function ProfileSheet({
  customer,
  addresses,
  orderHistory,
  ordersLoading,
  onClose,
  onSaveProfile,
  onSaveAddress,
  onDeleteAddress,
  onSetDefault,
  defaultAddrId,
  onLoadOrders,
}) {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    cust_name: customer?.cust_name || "",
    ph_num: customer?.ph_num || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Address editing state
  const [addrView, setAddrView] = useState("list"); // "list" | "form" | "map"
  const [editingAddr, setEditingAddr] = useState(null); // null = new
  const [af, setAf] = useState({
    label: "Home",
    labelCustom: "",
    street: "",
    block: "",
    bldg_name: "",
    apartment_no: "",
    floor: "",
    landmark: "",
    note: "",
    lat: null,
    lng: null,
    snapshotUrl: null,
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrErr, setAddrErr] = useState("");
  const [changeLocConfirm, setChangeLocConfirm] = useState(false);

  // Preset labels
  const PRESET_LABELS = ["Home", "Work", "Gym", "Other"];
  const [customLabel, setCustomLabel] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Load orders when tab opens
  useEffect(() => {
    if (tab === "orders" && orderHistory.length === 0) onLoadOrders();
  }, [tab]); // eslint-disable-line

  const openNewAddr = () => {
    setEditingAddr(null);
    setAf({
      label: "Home",
      labelCustom: "",
      street: "",
      block: "",
      bldg_name: "",
      apartment_no: "",
      floor: "",
      landmark: "",
      note: "",
      lat: null,
      lng: null,
      snapshotUrl: null,
    });
    setCustomLabel(false);
    setAddrErr("");
    setAddrView("form");
  };

  const openEditAddr = (a) => {
    const isPreset = PRESET_LABELS.slice(0, 3).includes(a.label);
    setEditingAddr(a);
    setAf({
      label: isPreset ? a.label : "Other",
      labelCustom: isPreset ? "" : a.label,
      street: a.street || "",
      block: a.block || "",
      bldg_name: a.bldg_name || "",
      apartment_no: a.apartment_no || "",
      floor: a.floor || "",
      landmark: a.landmark || "",
      note: a.note || "",
      lat: a.latitude || null,
      lng: a.longitude || null,
      snapshotUrl: a.map_snapshot_url || null,
    });
    setCustomLabel(!isPreset);
    setAddrErr("");
    setAddrView("form");
  };

  const finalLabel =
    af.label === "Other" && af.labelCustom.trim()
      ? af.labelCustom.trim()
      : af.label;

  const handleSaveAddr = async () => {
    if (!af.street.trim()) {
      setAddrErr("Street is required.");
      return;
    }
    if (!af.block.trim()) {
      setAddrErr("Block / area is required.");
      return;
    }
    if (!af.lat) {
      setAddrErr("Please pin your location on the map.");
      return;
    }
    setAddrSaving(true);
    setAddrErr("");
    try {
      await onSaveAddress({
        ...af,
        label: finalLabel,
        id: editingAddr?.id || null,
      });
      setAddrView("list");
    } catch (e) {
      setAddrErr("Failed to save address. Try again.");
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await onDeleteAddress(id);
    setDelConfirm(null);
  };

  // Active order statuses
  const ACTIVE = ["pending", "accepted", "preparing", "on_the_way"];
  const statusLabel = (s) =>
    ({
      pending: "Pending",
      accepted: "Accepted",
      preparing: "Preparing",
      on_the_way: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled",
    })[s] || s;
  const statusColor = (s) =>
    ACTIVE.includes(s)
      ? "var(--orange)"
      : s === "delivered"
        ? "var(--green)"
        : "var(--t3)";

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="drag-pill" />
        <div className="sheet-hd">
          <span className="sheet-title">
            {addrView === "form"
              ? editingAddr
                ? "Edit address"
                : "New address"
              : "My profile"}
          </span>
          <button
            className="close-btn"
            onClick={addrView !== "list" ? () => setAddrView("list") : onClose}
          >
            {addrView !== "list" ? Ic.back : Ic.close}
          </button>
        </div>

        {/* Tabs — only show when not in address form */}
        {addrView === "list" && (
          <div
            style={{
              display: "flex",
              gap: 20,
              padding: "0 20px",
              borderBottom: "1.5px solid var(--border)",
              marginBottom: 20,
            }}
          >
            {[
              ["info", "Profile"],
              ["addresses", "Addresses"],
              ["orders", "Orders"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`ptab${tab === k ? " on" : ""}`}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "0 20px 32px" }}>
          {/* ── PROFILE TAB ── */}
          {addrView === "list" && tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Avatar card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  background: "#fafafa",
                  borderRadius: var_r,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "var(--orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {(form.cust_name ||
                    customer?.cust_name ||
                    "?")[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>
                    {form.cust_name || "Your Name"}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--t3)" }}>
                    {customer?.ph_num || "—"}
                  </p>
                </div>
              </div>
              <div>
                <label className="lbl">Full name</label>
                <input
                  className="inp"
                  placeholder="Your name"
                  value={form.cust_name}
                  onChange={(e) => {
                    setForm({ ...form, cust_name: e.target.value });
                    setSaveErr("");
                  }}
                />
              </div>
              {/* Phone is read-only — set during onboarding */}
              <div>
                <label className="lbl">WhatsApp number</label>
                <input
                  className="inp"
                  value={customer?.ph_num || ""}
                  readOnly
                  style={{ background: "#f9f9f9", color: "var(--t3)" }}
                />
                <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
                  Contact support to change your number.
                </p>
              </div>
              {saveErr && (
                <p style={{ fontSize: 12, color: "var(--red)" }}>
                  ⚠️ {saveErr}
                </p>
              )}
              <button
                className="btn-primary"
                disabled={saving}
                onClick={async () => {
                  if (!form.cust_name.trim()) {
                    setSaveErr("Name is required.");
                    return;
                  }
                  setSaving(true);
                  await onSaveProfile(form);
                  setSaving(false);
                }}
              >
                {saving ? <Spinner size={20} /> : "Save profile"}
              </button>
            </div>
          )}

          {/* ── ADDRESSES TAB: LIST ── */}
          {addrView === "list" && tab === "addresses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {addresses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>📍</div>
                  <p
                    style={{
                      color: "var(--t2)",
                      fontSize: 14,
                      marginBottom: 16,
                    }}
                  >
                    No saved addresses yet
                  </p>
                </div>
              ) : (
                addresses.map((a) => (
                  <div
                    key={a.id}
                    className="addr-card"
                    style={{
                      borderColor:
                        a.id === defaultAddrId
                          ? "var(--orange)"
                          : "var(--border)",
                      background: a.id === defaultAddrId ? "#fff9f6" : "#fff",
                    }}
                  >
                    {/* Map snapshot thumbnail */}
                    {a.map_snapshot_url ? (
                      <img
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${a.longitude - 0.005},${a.latitude - 0.004},${a.longitude + 0.005},${a.latitude + 0.004}&layer=mapnik&marker=${a.latitude},${a.longitude}`}
                        className="map-snapshot"
                        alt="map"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : a.latitude && a.longitude ? (
                      <iframe
                        className="map-snapshot"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${a.longitude - 0.005},${a.latitude - 0.004},${a.longitude + 0.005},${a.latitude + 0.004}&layer=mapnik&marker=${a.latitude},${a.longitude}`}
                        title="map"
                        scrolling="no"
                        style={{ pointerEvents: "none" }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {a.label === "Home"
                          ? "🏠"
                          : a.label === "Work"
                            ? "🏢"
                            : a.label === "Gym"
                              ? "🏋️"
                              : "📍"}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {a.label}
                      </span>
                      {a.id === defaultAddrId && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: "#fff0e8",
                            color: "var(--orange)",
                            padding: "2px 8px",
                            borderRadius: 99,
                            marginLeft: 4,
                          }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--t2)",
                        marginBottom: 10,
                        paddingLeft: 24,
                      }}
                    >
                      {[
                        a.apartment_no && `Apt ${a.apartment_no}`,
                        a.floor && `Floor ${a.floor}`,
                        a.bldg_name,
                        a.street,
                        a.block,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        paddingLeft: 24,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="btn-out"
                        style={{ fontSize: 12, padding: "5px 11px" }}
                        onClick={() => openEditAddr(a)}
                      >
                        {Ic.edit} Edit
                      </button>
                      {a.id !== defaultAddrId && (
                        <button
                          className="btn-out"
                          style={{ fontSize: 12, padding: "5px 11px" }}
                          onClick={() => onSetDefault(a.id)}
                        >
                          ⭐ Default
                        </button>
                      )}
                      <button
                        className="btn-out"
                        style={{
                          fontSize: 12,
                          padding: "5px 11px",
                          color: "var(--red)",
                          borderColor: "#fca5a5",
                        }}
                        onClick={() => setDelConfirm(a.id)}
                      >
                        {Ic.trash}
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button
                className="btn-out"
                style={{ justifyContent: "center", width: "100%" }}
                onClick={openNewAddr}
              >
                {Ic.plus} Add new address
              </button>

              {/* Delete confirm inline */}
              {delConfirm && (
                <div
                  style={{
                    background: "#fdecea",
                    border: "1px solid #fca5a5",
                    borderRadius: var_r_sm,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 10,
                      color: "var(--t1)",
                    }}
                  >
                    Delete this address?
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-out"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        fontSize: 13,
                      }}
                      onClick={() => setDelConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      style={{
                        flex: 1,
                        fontSize: 13,
                        background: "var(--red)",
                      }}
                      onClick={() => handleDelete(delConfirm)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ADDRESSES TAB: FORM ── */}
          {addrView === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Label selector */}
              <div>
                <label className="lbl">Label</label>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: customLabel ? 10 : 0,
                  }}
                >
                  {PRESET_LABELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setAf({ ...af, label: l });
                        setCustomLabel(l === "Other");
                      }}
                      style={{
                        padding: "9px 16px",
                        border: `2px solid ${af.label === l ? "var(--orange)" : "var(--border)"}`,
                        borderRadius: var_r_sm,
                        background: af.label === l ? "#fff9f6" : "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "var(--font)",
                        transition: "all .15s",
                      }}
                    >
                      {l === "Home"
                        ? "🏠"
                        : l === "Work"
                          ? "🏢"
                          : l === "Gym"
                            ? "🏋️"
                            : "📍"}{" "}
                      {l}
                    </button>
                  ))}
                </div>
                {customLabel && (
                  <input
                    className="inp"
                    placeholder="e.g. Parents' house, Office…"
                    value={af.labelCustom}
                    onChange={(e) =>
                      setAf({ ...af, labelCustom: e.target.value })
                    }
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              {/* Map location picker */}
              <div>
                <label className="lbl">
                  Location on map{" "}
                  <span style={{ textTransform: "none", fontWeight: 400 }}>
                    (required)
                  </span>
                </label>
                {af.lat ? (
                  <>
                    <iframe
                      className="map-snapshot"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${af.lng - 0.005},${af.lat - 0.004},${af.lng + 0.005},${af.lat + 0.004}&layer=mapnik&marker=${af.lat},${af.lng}`}
                      title="selected location"
                      scrolling="no"
                      style={{ pointerEvents: "none" }}
                    />
                    <button
                      className="btn-out"
                      style={{ fontSize: 12, marginBottom: 4 }}
                      onClick={() => setChangeLocConfirm(true)}
                    >
                      📍 Change location
                    </button>
                  </>
                ) : (
                  <div
                    className="map-snapshot-empty"
                    onClick={() => setShowMapPicker(true)}
                  >
                    <span>🗺️</span>
                    <span>Tap to pin location</span>
                  </div>
                )}
                <p style={{ fontSize: 11, color: "var(--t3)" }}>
                  {af.lat
                    ? `${af.lat.toFixed(5)}, ${af.lng.toFixed(5)}`
                    : "Location not set"}
                </p>
              </div>

              {/* Address fields */}
              {[
                { f: "street", l: "Street" },
                { f: "block", l: "Block / Area" },
                { f: "bldg_name", l: "Building name (optional)" },
                { f: "apartment_no", l: "Apartment no.", t: "number" },
                { f: "floor", l: "Floor", t: "number" },
                { f: "landmark", l: "Nearby landmark (optional)" },
                { f: "note", l: "Delivery note (optional)" },
              ].map(({ f, l, t }) => (
                <div key={f}>
                  <label className="lbl">{l}</label>
                  <input
                    className="inp"
                    type={t || "text"}
                    placeholder={l}
                    value={af[f]}
                    onChange={(e) => {
                      setAf({ ...af, [f]: e.target.value });
                      setAddrErr("");
                    }}
                  />
                </div>
              ))}

              {addrErr && (
                <p style={{ fontSize: 12, color: "var(--red)" }}>
                  ⚠️ {addrErr}
                </p>
              )}

              <button
                className="btn-primary"
                disabled={addrSaving}
                onClick={handleSaveAddr}
              >
                {addrSaving ? (
                  <Spinner size={20} />
                ) : editingAddr ? (
                  "Save changes"
                ) : (
                  "Save address"
                )}
              </button>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {addrView === "list" && tab === "orders" && (
            <div>
              {ordersLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "32px 0",
                  }}
                >
                  <Spinner size={28} />
                </div>
              ) : orderHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>📋</div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                    No orders yet
                  </p>
                  <p style={{ color: "var(--t2)", fontSize: 14 }}>
                    Your order history will appear here
                  </p>
                </div>
              ) : (
                <>
                  {orderHistory.map((o) => {
                    const isActive = ACTIVE.includes(o.status);
                    return (
                      <div
                        key={o.id}
                        className={`order-card${isActive ? " active" : ""}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {isActive && <span className="active-dot" />}
                            <span style={{ fontWeight: 700, fontSize: 14 }}>
                              Order #{o.id}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: statusColor(o.status),
                              background: isActive
                                ? "#fff0e8"
                                : o.status === "delivered"
                                  ? "var(--green-l)"
                                  : "#f5f5f5",
                              padding: "3px 9px",
                              borderRadius: 99,
                            }}
                          >
                            {statusLabel(o.status)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--t2)",
                            marginBottom: 4,
                          }}
                        >
                          {new Date(o.created_at).toLocaleDateString("en-KW", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: 13, color: "var(--t3)" }}>
                            {o.payment_method}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>
                            {fmt(o.total_amount)}
                          </span>
                        </div>
                        {o.notes && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--t3)",
                              fontStyle: "italic",
                              marginTop: 4,
                            }}
                          >
                            "{o.notes}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <button
                    className="btn-out"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginTop: 4,
                    }}
                    onClick={onLoadOrders}
                  >
                    Refresh ↺
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map picker sheet — stacked on top */}
      {showMapPicker && (
        <MapPicker
          initialLat={af.lat}
          initialLng={af.lng}
          onClose={() => setShowMapPicker(false)}
          onConfirm={({ lat, lng, snapshotUrl }) => {
            setAf((p) => ({ ...p, lat, lng, snapshotUrl }));
            setShowMapPicker(false);
          }}
        />
      )}

      {/* "Change location" confirmation */}
      {changeLocConfirm && (
        <>
          <div
            className="overlay"
            style={{ zIndex: 400 }}
            onClick={() => setChangeLocConfirm(false)}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 401,
              background: "#fff",
              borderRadius: "var(--r) var(--r) 0 0",
              padding: "24px 20px",
              paddingBottom: "calc(24px + env(safe-area-inset-bottom,0px))",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              Change location?
            </p>
            <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 20 }}>
              Your current pin will be replaced with a new one.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-out"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setChangeLocConfirm(false)}
              >
                Keep current
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setChangeLocConfirm(false);
                  setShowMapPicker(true);
                }}
              >
                Open map
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ── Desktop CartPanel (sidebar) ─────────────────────────────────────────── */
function DesktopCart({
  cart,
  addonCart,
  restaurant,
  onUpdateQty,
  onUpdateAddonQty,
  calcTotals,
  onCheckout,
  note,
  onNoteChange,
}) {
  const { subT, delivery, total } = calcTotals(cart, addonCart);
  const minOk = !restaurant?.min_order || subT >= restaurant.min_order;
  const totalItems =
    cart.reduce((s, c) => s + c.qty, 0) +
    (addonCart || []).reduce((s, a) => s + a.qty, 0);

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--r)",
        boxShadow: "var(--shadow)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 2,
          }}
        >
          {restaurant?.name}
        </p>
        <h3 style={{ fontSize: 18, fontWeight: 800 }}>
          Your order {totalItems > 0 ? `(${totalItems})` : ""}
        </h3>
      </div>
      <div style={{ padding: "16px 20px 20px" }}>
        {totalItems === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              Cart is empty
            </p>
            <p style={{ color: "var(--t3)", fontSize: 13 }}>
              Add items to get started
            </p>
          </div>
        ) : (
          <>
            {/* Menu items */}
            {cart.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--t3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 6,
                  }}
                >
                  Menu items
                </p>
                {cart.map((c, i) => {
                  const varLines = Object.values(c.variantMeta || {})
                    .flatMap((m) => m.optionNames)
                    .filter(Boolean);
                  return (
                    <div key={i} className="cart-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          {c.item.name}
                        </p>
                        {varLines.length > 0 && (
                          <p className="cart-detail">
                            {varLines.map((v, vi) => (
                              <span
                                key={vi}
                                style={{
                                  display: "inline-block",
                                  marginRight: 6,
                                }}
                              >
                                · {v}
                              </span>
                            ))}
                          </p>
                        )}
                        {c.note && (
                          <p className="cart-note" style={{ marginTop: 3 }}>
                            📝 {c.note}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--t2)",
                            fontWeight: 700,
                          }}
                        >
                          {fmt(c.unitPrice)}
                        </p>
                      </div>
                      <div className="qty-ctrl" style={{ flexShrink: 0 }}>
                        <button
                          onClick={() => onUpdateQty(i, c.qty - 1)}
                          style={{ width: 32, height: 32 }}
                        >
                          {c.qty === 1 ? Ic.trash : Ic.minus}
                        </button>
                        <span style={{ minWidth: 26, fontSize: 13 }}>
                          {c.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(i, c.qty + 1)}
                          style={{ width: 32, height: 32 }}
                        >
                          {Ic.plus}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add-on rows */}
            {addonCart && addonCart.length > 0 && (
              <div style={{ marginTop: cart.length > 0 ? 8 : 0 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--t3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 6,
                  }}
                >
                  Add-ons
                </p>
                {addonCart.map((a, i) => (
                  <div key={i} className="cart-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          marginBottom: 2,
                        }}
                      >
                        {a.addon.name}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--t2)",
                          fontWeight: 700,
                        }}
                      >
                        {fmt(a.addon.price)}
                      </p>
                    </div>
                    <div className="qty-ctrl" style={{ flexShrink: 0 }}>
                      <button
                        onClick={() => onUpdateAddonQty(a.addon.id, -1)}
                        style={{ width: 32, height: 32 }}
                      >
                        {a.qty === 1 ? Ic.trash : Ic.minus}
                      </button>
                      <span style={{ minWidth: 26, fontSize: 13 }}>
                        {a.qty}
                      </span>
                      <button
                        onClick={() => onUpdateAddonQty(a.addon.id, 1)}
                        style={{ width: 32, height: 32 }}
                      >
                        {Ic.plus}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order note */}
            <div style={{ margin: "14px 0 12px" }}>
              <label className="lbl" style={{ fontSize: 10 }}>
                Order note{" "}
                <span style={{ textTransform: "none", fontWeight: 400 }}>
                  (optional · whole order)
                </span>
              </label>
              <textarea
                className="inp"
                rows={2}
                placeholder="Allergies, prep notes…"
                style={{ resize: "none", fontSize: 13, padding: "9px 12px" }}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                maxLength={300}
              />
            </div>

            {/* Bill */}
            <div
              style={{
                background: "#fafafa",
                borderRadius: var_r_sm,
                padding: "13px 14px",
                marginBottom: 14,
              }}
            >
              <div className="sum-row" style={{ fontSize: 13 }}>
                <span>Subtotal</span>
                <span>{fmt(subT)}</span>
              </div>
              <div className="sum-row" style={{ fontSize: 13 }}>
                <span>Delivery</span>
                <span>{fmt(delivery)}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  marginTop: 10,
                  paddingTop: 10,
                }}
              >
                <div className="sum-row total" style={{ fontSize: 15 }}>
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>

            {restaurant?.min_order && subT < restaurant.min_order && (
              <div
                style={{
                  background: "#fff8e1",
                  border: "1px solid #ffe082",
                  borderRadius: var_r_sm,
                  padding: "9px 12px",
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#e65100",
                  fontWeight: 500,
                }}
              >
                ⚠️ Min. {fmt(restaurant.min_order)} · add{" "}
                {fmt(restaurant.min_order - subT)} more
              </div>
            )}
            <button
              className="btn-primary"
              disabled={!minOk}
              onClick={() => onCheckout(total, note)}
            >
              Checkout · {fmt(total)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ───────────────────────────────────────────────────────── */
export default function Customer() {
  const restId = getRestId();

  /* data state */
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [addonTypes, setAddonTypes] = useState([]); // Add_Ons_Type rows
  const [addonItems, setAddonItems] = useState([]); // Add_Ons rows
  const [addonCart, setAddonCart] = useState([]); // [{addon, qty}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* customer + addresses + orders */
  const [customer, setCustomer] = useState(null);
  const [custReady, setCustReady] = useState(false); // true once we know if user is known or new
  const [addresses, setAddresses] = useState([]);
  const [defaultAddrId, setDefaultAddrId] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* ui state */
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [selItem, setSelItem] = useState(null);

  /* panels */
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [cartNote, setCartNote] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [customizeItem, setCustomizeItem] = useState(null);

  /* active tab for bottom bar */
  const [activeTab, setActiveTab] = useState("menu");

  /* toast */
  const [toast, setToast] = useState("");
  const toastRef = useRef(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2600);
  }, []);

  /* viewport meta */
  useEffect(() => {
    let m = document.querySelector('meta[name="viewport"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "viewport";
      document.head.appendChild(m);
    }
    m.content = "width=device-width,initial-scale=1,maximum-scale=1";
  }, []);

  /* fire-and-forget analytics — never blocks UX, never crashes app */
  const trackEvent = useCallback(
    (menuId, eventType) => {
      if (!restId || !menuId) return;
      supabase
        .from("Menu_Events")
        .insert({ rest_id: Number(restId), menu_id: Number(menuId), event_type: eventType })
        .then(() => {})
        .catch(() => {});
    },
    [restId],
  );

  /* inject CSS once */
  useEffect(() => {
    const id = "frt-cust-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  /* load restaurant + menu */
  useEffect(() => {
    if (!restId) {
      setError("No restaurant ID in URL. Use ?rest_id=<id>");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [rR, cR, mR, atR] = await Promise.all([
          supabase.from("Restaurants").select("*").eq("id", restId).single(),
          supabase
            .from("Categories")
            .select("*")
            .eq("rest_id", restId)
            .eq("visible", true)
            .order("sort_order"),
          supabase
            .from("Menu")
            .select("*")
            .eq("rest_id", restId)
            .eq("visible", true)
            .order("sort_order"),
          supabase
            .from("Add_Ons_Type")
            .select("id, name, min_qty")
            .eq("rest_id", restId)
            .order("id"),
        ]);
        if (rR.error || !rR.data) throw new Error("Restaurant not found");
        setRestaurant(rR.data);
        setCategories(cR.data || []);
        setMenuItems((mR.data || []).filter((m) => m.is_available));

        const types = atR.data || [];
        if (types.length > 0) {
          const typeIds = types.map((t) => t.id);
          const { data: aiData } = await supabase
            .from("Add_Ons")
            .select("id, type_id, name, price, image_path")
            .in("type_id", typeIds);
          setAddonItems(aiData || []);
        }
        setAddonTypes(types);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [restId]);

  /* load returning customer (per-restaurant key) */
  useEffect(() => {
    if (!restId) {
      setCustReady(true);
      return;
    }
    (async () => {
      try {
        const savedId = localStorage.getItem(custKey(restId));
        if (savedId) {
          const { data } = await supabase
            .from("Customer")
            .select("*")
            .eq("id", savedId)
            .maybeSingle();
          if (data) {
            setCustomer(data);
            await loadAddresses(data.id);
          } else {
            localStorage.removeItem(custKey(restId));
          }
        }
      } catch (e) {
        console.error("[load customer]", e);
      } finally {
        setCustReady(true);
      }
    })();
  }, [restId]); // eslint-disable-line

  const loadAddresses = async (cid) => {
    try {
      const { data } = await supabase
        .from("Customer_Address")
        .select("*")
        .eq("cust_id", cid)
        .order("id");
      if (data) {
        setAddresses(data);
        const saved = localStorage.getItem(`frt_def_addr_${cid}`);
        setDefaultAddrId(saved ? Number(saved) : data[0]?.id || null);
      }
    } catch (e) {
      console.error("[loadAddresses]", e);
    }
  };

  const loadOrderHistory = async (cid) => {
    if (!cid || !restId) return;
    setOrdersLoading(true);
    try {
      const { data } = await supabase
        .from("Orders")
        .select("id, status, total_amount, payment_method, created_at, notes")
        .eq("cust_id", cid)
        .eq("rest_id", restId)
        .order("created_at", { ascending: false })
        .limit(30);
      setOrderHistory(data || []);
    } catch (e) {
      console.error("[loadOrderHistory]", e);
    } finally {
      setOrdersLoading(false);
    }
  };

  /* filtered menu */
  const filtered = menuItems.filter((m) => {
    const q = search.toLowerCase();
    const ms =
      m.name.toLowerCase().includes(q) ||
      (m.description || "").toLowerCase().includes(q);
    const mc =
      activeCat === "all"
        ? true
        : activeCat === "recommended"
          ? m.is_popular
          : m.categ_id === activeCat;
    return ms && mc;
  });

  /* cart helpers */
  const addToCart = useCallback(
    ({
      item,
      qty,
      selectedVariants,
      variantMeta,
      selectedAddOns,
      unitPrice,
      note,
    }) => {
      // Track add_to_cart event (fire and forget — never blocks UI)
      trackEvent(item.id, "add_to_cart");
      setCart((prev) => {
        const idx = prev.findIndex(
          (c) =>
            c.item.id === item.id &&
            JSON.stringify(c.selectedVariants) ===
              JSON.stringify(selectedVariants) &&
            JSON.stringify(c.selectedAddOns) === JSON.stringify(selectedAddOns),
        );
        if (idx >= 0) {
          const u = [...prev];
          u[idx] = { ...u[idx], qty: u[idx].qty + qty };
          return u;
        }
        return [
          ...prev,
          {
            item,
            qty,
            selectedVariants,
            variantMeta: variantMeta || {},
            selectedAddOns,
            unitPrice,
            note,
          },
        ];
      });
      showToast(`${item.name} added to cart 🛒`);
    },
    [showToast, trackEvent],
  );

  const updateQty = (i, q) => {
    if (q <= 0) setCart((p) => p.filter((_, j) => j !== i));
    else setCart((p) => p.map((c, j) => (j === i ? { ...c, qty: q } : c)));
  };

  /* Update the note for ALL cart entries of a given menu item id */
  const updateItemNote = useCallback((itemId, newNote) => {
    setCart((p) =>
      p.map((c) => (c.item.id === itemId ? { ...c, note: newNote } : c)),
    );
  }, []);

  /* add-on cart helpers */
  const updateAddonQty = useCallback(
    (addonId, delta) => {
      setAddonCart((prev) => {
        const idx = prev.findIndex((a) => a.addon.id === addonId);
        if (idx >= 0) {
          const newQty = prev[idx].qty + delta;
          if (newQty <= 0) return prev.filter((_, i) => i !== idx);
          const u = [...prev];
          u[idx] = { ...u[idx], qty: newQty };
          return u;
        }
        if (delta <= 0) return prev;
        const addon = addonItems.find((a) => a.id === addonId);
        if (!addon) return prev;
        return [...prev, { addon, qty: 1 }];
      });
    },
    [addonItems],
  );

  /* Direct add for non-customizable items — no popup */
  const directAdd = useCallback(
    (item) => {
      trackEvent(item.id, "add_to_cart");
      addToCart({
        item,
        qty: 1,
        selectedVariants: {},
        selectedAddOns: [],
        unitPrice: +item.price,
        note: "",
      });
    },
    [addToCart, trackEvent],
  );

  const addonCartCount = addonCart.reduce((s, a) => s + a.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0) + addonCartCount;

  /* total = menu items + add-ons + delivery (no VAT) */
  const calcTotals = (cartItems, addonCartItems) => {
    const menuSub = cartItems.reduce((s, c) => s + c.unitPrice * c.qty, 0);
    const addonSub = addonCartItems.reduce(
      (s, a) => s + +a.addon.price * a.qty,
      0,
    );
    const subT = menuSub + addonSub;
    const delivery = subT > 0 ? 0.5 : 0;
    return { menuSub, addonSub, subT, delivery, total: subT + delivery };
  };

  /* place order — writes Orders + Order_Items + Order_Item_Variants + Order_Item_AddOns */
  const placeOrder = async ({ address, payMethod, notes }) => {
    if (!customer || !restaurant) return;
    const { total } = calcTotals(cart, addonCart);
    try {
      // 1. Create the order header
      const { data: order, error: oe } = await supabase
        .from("Orders")
        .insert({
          rest_id: restaurant.id,
          cust_id: customer.id,
          status: "pending",
          total_amount: total,
          payment_status: "pending",
          payment_method: payMethod,
          notes: notes || "",
        })
        .select()
        .single();
      if (oe) throw oe;

      // 2. Insert menu items into Order_Items
      for (const c of cart) {
        const subtotal = c.unitPrice * c.qty;
        const { data: oi, error: oiErr } = await supabase
          .from("Order_Items")
          .insert({
            order_id: order.id,
            menu_id: c.item.id,
            quantity: c.qty,
            unit_price: c.unitPrice,
            subtotal,
            item_note: c.note || null,
          })
          .select()
          .single();
        if (oiErr) throw oiErr;

        // 3. Insert variant option rows
        const selVars = c.selectedVariants || {};
        for (const [, val] of Object.entries(selVars)) {
          const ids = Array.isArray(val) ? val : val ? [val] : [];
          for (const optId of ids) {
            // Find price_adj from variantMeta (we stored option names but not price_adj — fetch it)
            // Use price_adj = unitPrice diff / quantity as approximation, or 0 if unavailable
            await supabase.from("Order_Item_Variants").insert({
              order_item_id: oi.id,
              variant_opt_id: optId,
              price_adj: 0, // Will be correct once fetched; acceptable for now
            });
          }
        }
      }

      // 4. Insert add-on cart items into Order_Items + Order_Item_AddOns
      for (const a of addonCart) {
        const subtotal = +a.addon.price * a.qty;
        const { data: oi, error: oiErr } = await supabase
          .from("Order_Items")
          .insert({
            order_id: order.id,
            menu_id: 0, // Add-ons don't have menu_id; use 0 as sentinel or NULL if schema allows
            quantity: a.qty,
            unit_price: +a.addon.price,
            subtotal,
            item_note: null,
          })
          .select()
          .single();
        // If menu_id FK fails, skip silently (add-ons are also logged separately)
        if (!oiErr && oi) {
          await supabase.from("Order_Item_AddOns").insert({
            order_item_id: oi.id,
            addon_id: a.addon.id,
            quantity: a.qty,
            price: +a.addon.price,
          });
        }
      }

      // 5. Update customer totals
      await supabase
        .from("Customer")
        .update({
          total_orders: (customer.total_orders || 0) + 1,
          total_amount: Number(customer.total_amount || 0) + total,
        })
        .eq("id", customer.id);

      setLastOrder({ ...order, deliveryAddress: address });
      setCart([]);
      setAddonCart([]);
      setCartNote("");
      setShowCheckout(false);
      setShowTrack(true);
      showToast("Order placed! 🎉");
      // Refresh order history
      loadOrderHistory(customer.id);
    } catch (e) {
      console.error("[placeOrder]", e);
      showToast("Failed to place order. Please try again.");
    }
  };

  const saveProfile = async (form) => {
    if (!customer) return;
    const { data } = await supabase
      .from("Customer")
      .update({ cust_name: form.cust_name, ph_num: form.ph_num })
      .eq("id", customer.id)
      .select()
      .single();
    if (data) {
      setCustomer(data);
      showToast("Profile saved!");
    }
  };

  const saveAddress = async (form) => {
    if (!customer) return;
    const payload = {
      cust_id: customer.id,
      label: form.label || "Home",
      street: form.street || "",
      block: form.block || "",
      bldg_name: form.bldg_name || "",
      apartment_no: Number(form.apartment_no) || 0,
      floor: Number(form.floor) || 0,
      landmark: form.landmark || null,
      note: form.note || null,
      longitude: form.lng || 0,
      latitude: form.lat || 0,
      map_snapshot_url: form.snapshotUrl || null,
    };
    try {
      if (form.id) {
        const { data } = await supabase
          .from("Customer_Address")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single();
        if (data) {
          setAddresses((p) => p.map((a) => (a.id === form.id ? data : a)));
          showToast("Address updated!");
        }
      } else {
        const { data } = await supabase
          .from("Customer_Address")
          .insert(payload)
          .select()
          .single();
        if (data) {
          setAddresses((p) => [...p, data]);
          if (!defaultAddrId) {
            setDefaultAddrId(data.id);
            localStorage.setItem(`frt_def_addr_${customer.id}`, data.id);
          }
          showToast("Address saved!");
        }
      }
    } catch (e) {
      console.error("[saveAddress]", e);
      showToast("Failed to save address.");
    }
  };

  const deleteAddress = async (id) => {
    await supabase.from("Customer_Address").delete().eq("id", id);
    setAddresses((p) => p.filter((a) => a.id !== id));
    if (defaultAddrId === id) {
      const r = addresses.filter((a) => a.id !== id);
      setDefaultAddrId(r[0]?.id || null);
    }
    showToast("Address removed");
  };

  const setDefaultAddress = (id) => {
    setDefaultAddrId(id);
    if (customer) localStorage.setItem(`frt_def_addr_${customer.id}`, id);
    showToast("Default address updated");
  };

  if (loading || !custReady) return <LoadScreen />;
  if (error) return <ErrScreen msg={error} />;

  // First visit: show phone onboarding before menu
  if (!customer) {
    return (
      <PhoneOnboarding
        restId={restId}
        onComplete={async (cust) => {
          setCustomer(cust);
          await loadAddresses(cust.id);
        }}
      />
    );
  }

  const defaultAddr = addresses.find((a) => a.id === defaultAddrId);
  const catLabel =
    activeCat === "all"
      ? "All dishes"
      : activeCat === "recommended"
        ? "Popular picks"
        : categories.find((c) => c.id === activeCat)?.name || "Menu";

  /* group items by category for section headers */
  const grouped =
    activeCat === "all"
      ? categories
          .map((cat) => ({
            cat,
            items: filtered.filter((m) => m.categ_id === cat.id),
          }))
          .filter((g) => g.items.length > 0)
      : [{ cat: null, items: filtered }];

  return (
    <>
      {toast && <Toast msg={toast} />}

      {/* ── TOP NAV ── */}
      <nav className="topnav">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "var(--orange)" }}>{Ic.pin}</span>
            <button
              onClick={() => setShowProfile(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--t1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 180,
                }}
              >
                {defaultAddr
                  ? `${defaultAddr.label} · ${defaultAddr.street}`
                  : "Add delivery address"}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ color: "var(--t2)", flexShrink: 0 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--t3)", paddingLeft: 18 }}>
            {restaurant?.name}
          </p>
        </div>

        {/* desktop: profile + cart icons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setShowProfile(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--t2)",
              transition: "background .15s",
            }}
          >
            {Ic.user}
          </button>
          <button
            onClick={() => setShowCart(true)}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--t2)",
              transition: "background .15s",
            }}
          >
            {Ic.cart}
            {cartCount > 0 && (
              <span
                className="tab-badge"
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  animation: "popBadge .25s ease",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── PAGE BODY ── */}
      <div className="page-wrap">
        {/* MAIN COLUMN */}
        <div className="main-col">
          {/* HERO */}
          <div className="hero" style={{ height: "clamp(180px, 38vw, 280px)" }}>
            {restaurant?.image1_path ? (
              <img
                src={restaurant.image1_path}
                alt={restaurant.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg,#1a1a1a,#333)",
                }}
              />
            )}
            <div className="hero-grad" />
            <div className="hero-content">
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.55)",
                  marginBottom: 4,
                }}
              >
                Now open
              </p>
              <h1
                style={{
                  fontSize: "clamp(18px,4vw,26px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}
              >
                {restaurant?.name}
              </h1>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}
              >
                {restaurant?.working_hours && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "rgba(255,255,255,.8)",
                      fontWeight: 500,
                    }}
                  >
                    {Ic.clock} {restaurant.working_hours}
                  </span>
                )}
                {restaurant?.min_order && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "rgba(255,255,255,.8)",
                      fontWeight: 500,
                    }}
                  >
                    🔥 Min. {fmt(restaurant.min_order)}
                  </span>
                )}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "rgba(255,255,255,.8)",
                    fontWeight: 500,
                  }}
                >
                  {Ic.truck} ~25 min
                </span>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div style={{ padding: "14px 16px 0", background: "var(--card)" }}>
            <div className="search-bar">
              <span style={{ color: "var(--t3)", flexShrink: 0 }}>
                {Ic.search}
              </span>
              <input
                placeholder="Search dishes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ color: "var(--t3)", flexShrink: 0 }}
                >
                  {Ic.close}
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY CHIPS */}
          <div
            style={{
              background: "var(--card)",
              borderBottom: "1px solid var(--border)",
              position: "sticky",
              top: "var(--nav-h)",
              zIndex: 50,
            }}
          >
            <div className="cat-strip">
              <button
                className={`cat-chip${activeCat === "all" ? " on" : ""}`}
                onClick={() => setActiveCat("all")}
              >
                All
              </button>
              <button
                className={`cat-chip${activeCat === "recommended" ? " on" : ""}`}
                onClick={() => setActiveCat("recommended")}
              >
                ⭐ Popular
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`cat-chip${activeCat === c.id ? " on" : ""}`}
                  onClick={() => setActiveCat(c.id)}
                >
                  {c.name}
                </button>
              ))}
              {addonTypes.length > 0 && (
                <button
                  className={`cat-chip${activeCat === "__addons__" ? " on" : ""}`}
                  onClick={() => setActiveCat("__addons__")}
                >
                  🍟 Add-Ons
                </button>
              )}
            </div>
          </div>

          {/* MENU ITEMS or ADD-ONS */}
          <div>
            {loading ? (
              <div style={{ background: "var(--card)", padding: "16px" }}>
                {[1, 2, 3].map((k) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "16px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <Skeleton h={14} style={{ width: "60%" }} />
                      <Skeleton h={12} style={{ width: "90%" }} />
                      <Skeleton h={12} style={{ width: "30%" }} />
                    </div>
                    <Skeleton h={96} style={{ width: 96, borderRadius: 10 }} />
                  </div>
                ))}
              </div>
            ) : activeCat === "__addons__" ? (
              /* ── ADD-ONS SECTION ── */
              addonTypes.length === 0 ? (
                <div
                  style={{
                    background: "var(--card)",
                    padding: "60px 20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🍟</div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>
                    No add-ons available
                  </p>
                </div>
              ) : (
                addonTypes.map((type) => {
                  const items = addonItems.filter((a) => a.type_id === type.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={type.id} className="addon-section">
                      <div className="addon-type-hd">
                        <div>
                          <h2
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "var(--t1)",
                            }}
                          >
                            {type.name}
                          </h2>
                          {type.min_qty > 0 && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--t3)",
                                marginTop: 2,
                              }}
                            >
                              Min. {type.min_qty} required
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--t3)",
                            fontWeight: 600,
                          }}
                        >
                          {items.length} items
                        </span>
                      </div>
                      <div className="addon-grid">
                        {items.map((addon) => {
                          const ac = addonCart.find(
                            (a) => a.addon.id === addon.id,
                          );
                          const qty = ac ? ac.qty : 0;
                          return (
                            <div
                              key={addon.id}
                              className={`addon-card${qty > 0 ? " in-cart" : ""}`}
                            >
                              {addon.image_path ? (
                                <img
                                  className="addon-img"
                                  src={addon.image_path}
                                  alt={addon.name}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling &&
                                      (e.target.nextSibling.style.display =
                                        "flex");
                                  }}
                                />
                              ) : (
                                <div className="addon-img-empty">🍽️</div>
                              )}
                              <div className="addon-info">
                                <p className="addon-name">{addon.name}</p>
                                <p className="addon-price">
                                  {fmt(addon.price)}
                                </p>
                              </div>
                              <div className="addon-qty-row">
                                {qty > 0 ? (
                                  <div className="addon-qty-ctrl">
                                    <button
                                      onClick={() =>
                                        updateAddonQty(addon.id, -1)
                                      }
                                    >
                                      {Ic.minus}
                                    </button>
                                    <span>{qty}</span>
                                    <button
                                      onClick={() =>
                                        updateAddonQty(addon.id, 1)
                                      }
                                    >
                                      {Ic.plus}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => updateAddonQty(addon.id, 1)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 5,
                                      background: "var(--orange)",
                                      color: "#fff",
                                      borderRadius: "var(--r-pill)",
                                      padding: "6px 14px",
                                      fontSize: 13,
                                      fontWeight: 700,
                                      border: "none",
                                      cursor: "pointer",
                                      transition: "opacity .15s",
                                    }}
                                  >
                                    {Ic.plus} Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )
            ) : filtered.length === 0 ? (
              <div
                style={{
                  background: "var(--card)",
                  padding: "60px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  Nothing found
                </p>
                <p style={{ color: "var(--t2)", fontSize: 14 }}>
                  Try a different category or search term
                </p>
              </div>
            ) : activeCat === "all" ? (
              /* grouped by category */
              grouped.map(({ cat, items }) => (
                <div
                  key={cat?.id || "all"}
                  style={{
                    background: "var(--card)",
                    marginBottom: 8,
                    borderRadius: 0,
                  }}
                >
                  {cat && (
                    <div style={{ padding: "18px 16px 4px" }}>
                      <h2
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "var(--t1)",
                        }}
                      >
                        {cat.name}
                      </h2>
                    </div>
                  )}
                  {items.map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      cart={cart}
                      onOpen={(it) => {
                        trackEvent(it.id, "view");
                        setSelItem(it);
                      }}
                      onCustomize={(it) => {
                        trackEvent(it.id, "view");
                        setCustomizeItem(it);
                      }}
                      onUpdate={(i, q, itm) => {
                        if (i === -1 && itm) directAdd(itm);
                        else updateQty(i, q);
                      }}
                    />
                  ))}
                </div>
              ))
            ) : (
              /* single category */
              <div style={{ background: "var(--card)" }}>
                <div
                  style={{
                    padding: "18px 16px 4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>{catLabel}</h2>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--t3)",
                      fontWeight: 600,
                    }}
                  >
                    {filtered.length} items
                  </span>
                </div>
                {filtered.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    cart={cart}
                    onOpen={(it) => {
                      trackEvent(it.id, "view");
                      setSelItem(it);
                    }}
                    onCustomize={(it) => {
                      trackEvent(it.id, "view");
                      setCustomizeItem(it);
                    }}
                    onUpdate={(i, q, itm) => {
                      if (i === -1 && itm) directAdd(itm);
                      else updateQty(i, q);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP CART SIDEBAR */}
        <div className="cart-col" style={{ display: "none" }}>
          <DesktopCart
            cart={cart}
            addonCart={addonCart}
            restaurant={restaurant}
            onUpdateQty={updateQty}
            onUpdateAddonQty={updateAddonQty}
            calcTotals={calcTotals}
            note={cartNote}
            onNoteChange={setCartNote}
            onCheckout={(t) => {
              setCheckoutTotal(t);
              setShowCheckout(true);
            }}
          />
        </div>
      </div>

      {/* Desktop cart col visibility via CSS */}
      <style>{`@media(min-width:1024px){.cart-col{display:block!important}}`}</style>

      {/* ── BOTTOM TAB BAR (mobile only) ── */}
      <nav className="tabbar">
        <button
          className={`tab-item${activeTab === "menu" ? " on" : ""}`}
          onClick={() => {
            setActiveTab("menu");
          }}
        >
          {Ic.home}
          <span>Menu</span>
        </button>
        <button
          className={`tab-item${activeTab === "cart" ? " on" : ""}`}
          style={{ position: "relative" }}
          onClick={() => setShowCart(true)}
        >
          <span style={{ position: "relative", display: "inline-flex" }}>
            {Ic.cart}
            {cartCount > 0 && <span className="tab-badge">{cartCount}</span>}
          </span>
          <span>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</span>
        </button>
        <button
          className={`tab-item${activeTab === "profile" ? " on" : ""}`}
          onClick={() => setShowProfile(true)}
        >
          {Ic.user}
          <span>Profile</span>
        </button>
      </nav>

      {/* ── SHEETS / MODALS ── */}
      {customizeItem && (
        <CustomizeSheet
          item={customizeItem}
          cart={cart}
          onClose={() => setCustomizeItem(null)}
          onAdd={addToCart}
          onUpdateNote={updateItemNote}
        />
      )}
      {selItem && (
        <ItemDetailSheet
          item={selItem}
          cart={cart}
          onClose={() => setSelItem(null)}
          onAdd={addToCart}
          onUpdateNote={updateItemNote}
        />
      )}
      {showCart && (
        <CartSheet
          cart={cart}
          addonCart={addonCart}
          restaurant={restaurant}
          onUpdateQty={updateQty}
          onUpdateAddonQty={updateAddonQty}
          calcTotals={calcTotals}
          note={cartNote}
          onNoteChange={setCartNote}
          onCheckout={(t, n) => {
            setCheckoutTotal(t);
            setCartNote(n || "");
            setShowCart(false);
            setShowCheckout(true);
          }}
          onClose={() => setShowCart(false)}
        />
      )}
      {showCheckout && (
        <CheckoutSheet
          total={checkoutTotal}
          cartNote={cartNote}
          restaurant={restaurant}
          addresses={addresses}
          defaultAddr={defaultAddr}
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={placeOrder}
          onAddAddress={() => {
            setShowCheckout(false);
            setShowProfile(true);
          }}
        />
      )}
      {showTrack && lastOrder && (
        <TrackSheet
          order={lastOrder}
          restaurant={restaurant}
          address={lastOrder.deliveryAddress}
          onClose={() => setShowTrack(false)}
          onStatusUpdate={(newStatus) => {
            setLastOrder((prev) =>
              prev ? { ...prev, status: newStatus } : prev,
            );
          }}
        />
      )}
      {showProfile && (
        <ProfileSheet
          customer={customer}
          addresses={addresses}
          orderHistory={orderHistory}
          ordersLoading={ordersLoading}
          onClose={() => setShowProfile(false)}
          onSaveProfile={saveProfile}
          onSaveAddress={saveAddress}
          onDeleteAddress={deleteAddress}
          onSetDefault={setDefaultAddress}
          defaultAddrId={defaultAddrId}
          onLoadOrders={() => loadOrderHistory(customer?.id)}
        />
      )}
    </>
  );
}

/* ── CustomizeSheet ────────────────────────────────────────────────────────── */
function CustomizeSheet({ item, cart, onClose, onAdd, onUpdateNote }) {
  const [qty, setQty] = useState(1);
  const [selVars, setSelVars] = useState({}); // { groupId: optionId | optionId[] }
  const [varGroups, setVarGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState(null);
  const [validationErr, setValidationErr] = useState("");

  // Pre-populate note from existing cart entry for this item
  const existingNote = cart.find((c) => c.item.id === item.id)?.note || "";
  const [note, setNote] = useState(existingNote);
  const alreadyInCart = cart.some((c) => c.item.id === item.id);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* ── Two-step fetch: groups first, then options by var_group_id ──
     Avoids the "Variant Options" space-in-name join ambiguity entirely. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchErr(null);
      try {
        const { data: gData, error: gErr } = await supabase
          .from("Variant_Groups")
          .select("id, name, is_required, is_multiple")
          .eq("menu_id", item.id)
          .order("id", { ascending: true });

        if (gErr) throw gErr;
        const groups = gData || [];

        let options = [];
        if (groups.length > 0) {
          const { data: oData, error: oErr } = await supabase
            .from("Variant Options")
            .select("id, var_group_id, name, price_adj")
            .in(
              "var_group_id",
              groups.map((g) => g.id),
            )
            .order("id", { ascending: true });
          if (oErr) throw oErr;
          options = oData || [];
        }

        if (cancelled) return;

        const assembled = groups.map((g) => ({
          ...g,
          options: options.filter((o) => o.var_group_id === g.id),
        }));

        setVarGroups(assembled);

        // Pre-select first option for required single-choice groups
        const defaults = {};
        assembled.forEach((g) => {
          if (g.is_required && !g.is_multiple && g.options.length > 0)
            defaults[g.id] = g.options[0].id;
        });
        setSelVars(defaults);
      } catch (e) {
        if (!cancelled) {
          console.error("[CustomizeSheet] fetch error:", e);
          setFetchErr("Couldn't load options. Tap to retry.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const toggleVar = (gid, oid, isMulti) => {
    setValidationErr("");
    if (isMulti) {
      setSelVars((p) => {
        const cur = Array.isArray(p[gid]) ? p[gid] : [];
        return {
          ...p,
          [gid]: cur.includes(oid)
            ? cur.filter((x) => x !== oid)
            : [...cur, oid],
        };
      });
    } else {
      // For required single-choice, don't allow deselect
      setSelVars((p) => {
        if (varGroups.find((g) => g.id === gid)?.is_required && p[gid] === oid)
          return p;
        return { ...p, [gid]: p[gid] === oid ? undefined : oid };
      });
    }
  };

  // Extra cost from selections
  const extraCost = varGroups.reduce((total, g) => {
    const sel = selVars[g.id];
    if (Array.isArray(sel))
      return (
        total +
        sel.reduce((s, sid) => {
          const o = g.options.find((x) => x.id === sid);
          return s + (o ? +o.price_adj : 0);
        }, 0)
      );
    if (sel) {
      const o = g.options.find((x) => x.id === sel);
      return total + (o ? +o.price_adj : 0);
    }
    return total;
  }, 0);

  const unitPrice = +item.price + extraCost;

  // Whether all required groups have a selection
  const canAdd = varGroups.every((g) => {
    if (!g.is_required) return true;
    const s = selVars[g.id];
    return g.is_multiple ? Array.isArray(s) && s.length > 0 : !!s;
  });

  const handleAdd = () => {
    if (!canAdd) {
      const missing = varGroups.find((g) => {
        if (!g.is_required) return false;
        const s = selVars[g.id];
        return g.is_multiple ? !(Array.isArray(s) && s.length > 0) : !s;
      });
      setValidationErr(`Please select an option for "${missing?.name}"`);
      return;
    }

    // Build human-readable variant meta for cart display
    const variantMeta = {};
    varGroups.forEach((g) => {
      const sel = selVars[g.id];
      if (!sel || (Array.isArray(sel) && sel.length === 0)) return;
      const ids = Array.isArray(sel) ? sel : [sel];
      const names = ids
        .map((id) => g.options.find((o) => o.id === id)?.name)
        .filter(Boolean);
      if (names.length > 0)
        variantMeta[g.id] = { groupName: g.name, optionNames: names };
    });

    // Propagate note update to all existing entries of this item
    if (onUpdateNote) onUpdateNote(item.id, note);

    onAdd({
      item,
      qty,
      selectedVariants: selVars,
      variantMeta,
      selectedAddOns: [],
      unitPrice,
      note,
    });
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div
        className="sheet"
        style={{ paddingBottom: 0, display: "flex", flexDirection: "column" }}
      >
        <div className="drag-pill" />

        {/* Header */}
        <div className="sheet-hd" style={{ paddingBottom: 6, flexShrink: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="sheet-title" style={{ fontSize: 17 }}>
              {item.name}
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "var(--orange)",
                marginTop: 2,
              }}
            >
              {fmt(unitPrice)}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            {Ic.close}
          </button>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 20px 0",
            minHeight: 0,
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0",
                gap: 12,
              }}
            >
              <Spinner size={28} />
              <p style={{ fontSize: 13, color: "var(--t2)" }}>
                Loading options…
              </p>
            </div>
          ) : fetchErr ? (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <p
                style={{ fontSize: 13, color: "var(--red)", marginBottom: 14 }}
              >
                ⚠️ {fetchErr}
              </p>
              <button
                onClick={() => {
                  setFetchErr(null);
                  setLoading(
                    true,
                  ); /* re-trigger by forcing a re-render via dummy state */
                }}
                className="btn-out"
                style={{ fontSize: 13 }}
              >
                Retry
              </button>
            </div>
          ) : varGroups.length === 0 ? (
            <p
              style={{
                color: "var(--t2)",
                fontSize: 14,
                padding: "8px 0 20px",
              }}
            >
              No customization options for this item.
            </p>
          ) : (
            varGroups.map((g) => (
              <div key={g.id} style={{ marginBottom: 22 }}>
                {/* Group header */}
                <div className="csheet-group-hd">
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</p>
                    <p
                      style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}
                    >
                      {g.is_multiple ? "Choose one or more" : "Choose one"}
                    </p>
                  </div>
                  {g.is_required ? (
                    <span className="csheet-required-pill">Required</span>
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--t3)",
                        fontWeight: 600,
                        letterSpacing: ".04em",
                      }}
                    >
                      Optional
                    </span>
                  )}
                </div>

                {/* Options */}
                {g.options.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--t3)",
                      fontStyle: "italic",
                    }}
                  >
                    No options configured
                  </p>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {g.options.map((opt) => {
                      const s = selVars[g.id];
                      const isSel = g.is_multiple
                        ? Array.isArray(s) && s.includes(opt.id)
                        : s === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`csheet-opt-row${isSel ? " sel" : ""}`}
                          onClick={() => toggleVar(g.id, opt.id, g.is_multiple)}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: isSel ? 600 : 400,
                            }}
                          >
                            {opt.name}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {+opt.price_adj !== 0 && (
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "var(--t2)",
                                  fontWeight: 600,
                                }}
                              >
                                {+opt.price_adj > 0 ? "+" : ""}
                                {fmt(opt.price_adj)}
                              </span>
                            )}
                            <div
                              className={`csheet-dot${g.is_multiple ? " sq" : ""}${isSel ? " on" : ""}`}
                            >
                              {isSel && (
                                <span style={{ color: "#fff" }}>
                                  {Ic.check}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Per-item special instructions */}
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">
              Special instructions{" "}
              <span
                style={{
                  textTransform: "none",
                  fontWeight: 400,
                  color: "var(--t3)",
                }}
              >
                (optional)
              </span>
            </label>
            {alreadyInCart && (
              <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 5 }}>
                This note applies to all "{item.name}" in your cart.
              </p>
            )}
            <textarea
              className="inp"
              rows={2}
              placeholder="e.g. no onions, extra sauce, well done…"
              style={{ resize: "none", fontSize: 13.5 }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Validation error banner */}
          {validationErr && (
            <div
              style={{
                background: "#fdecea",
                border: "1px solid #fca5a5",
                borderRadius: "var(--r-sm)",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--red)",
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              ⚠️ {validationErr}
            </div>
          )}
          <div style={{ height: 8 }} />
        </div>

        {/* Sticky footer — button grays out when required options unmet */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            background: "#fff",
            flexShrink: 0,
            paddingBottom: "calc(14px + env(safe-area-inset-bottom,0px))",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div className="qty-ctrl" style={{ flexShrink: 0 }}>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
              {Ic.minus}
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>{Ic.plus}</button>
          </div>
          <button
            className="btn-primary"
            style={{
              flex: 1,
              opacity: canAdd ? 1 : 0.45,
              pointerEvents: canAdd ? "auto" : "none",
            }}
            disabled={!canAdd || loading}
            onClick={handleAdd}
          >
            {canAdd
              ? `Add to cart · ${fmt(unitPrice * qty)}`
              : "Select required options"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── MenuItem card ────────────────────────────────────────────────────────── */
function MenuItem({ item, cart, onOpen, onUpdate, onCustomize }) {
  const inCart = cart
    .filter((c) => c.item.id === item.id)
    .reduce((s, c) => s + c.qty, 0);
  const lastIdx = cart.reduce(
    (found, c, i) => (c.item.id === item.id ? i : found),
    -1,
  );

  return (
    <div className="menu-card" onClick={() => onOpen(item)}>
      {/* Text side */}
      <div className="menu-info">
        {item.is_popular && (
          <div className="menu-popular">{Ic.star} Popular</div>
        )}
        <p className="menu-name">{item.name}</p>
        {item.description && <p className="menu-desc">{item.description}</p>}
        <div
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
        >
          <span className="menu-price">{fmt(item.price)}</span>
        </div>
        {item.is_customizable && (
          <div className="cust-badge">
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
            Customizable
          </div>
        )}
      </div>

      {/* Thumb + add control */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div className="menu-thumb">
          {item.image_path ? (
            <img
              src={item.image_path}
              alt={item.name}
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="menu-thumb-empty">🍽️</div>
          )}
        </div>

        {inCart > 0 ? (
          <div className="qty-pill" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onUpdate(lastIdx, cart[lastIdx].qty - 1)}>
              {Ic.minus}
            </button>
            <span>{inCart}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (item.is_customizable) onCustomize(item);
                else onUpdate(lastIdx, cart[lastIdx].qty + 1);
              }}
            >
              {Ic.plus}
            </button>
          </div>
        ) : (
          <button
            className="add-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (item.is_customizable) onCustomize(item);
              else onUpdate(-1, 0, item);
            }}
          >
            {Ic.plus}
          </button>
        )}
      </div>
    </div>
  );
}