import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabaseClient";
import "./index.css";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#F7F5F0",
  surface: "#FFFFFF",
  surface2: "#F0EDE6",
  border: "#E4DFD6",
  border2: "#D6D0C6",
  muted: "#B0A898",
  subtle: "#6E6558",
  text: "#1C1A16",
  accent: "#C4711A",
  accentHover: "#A85E12",
  accentBg: "rgba(196,113,26,0.08)",
  accentBorder: "rgba(196,113,26,0.30)",
  scrollTrack: "#F0EDE6",
  scrollThumb: "#D6D0C6",
  toggleOff: "#D6D0C6",
  green: "#2D7A4F",
  greenBg: "#EBF5EF",
  greenBorder: "#B8DEC9",
  red: "#B83232",
};

const DARK = {
  bg: "#111210",
  surface: "#1A1917",
  surface2: "#222120",
  border: "#2C2A27",
  border2: "#363330",
  muted: "#4A4740",
  subtle: "#7A7568",
  text: "#F0EAD8",
  accent: "#D4821E",
  accentHover: "#E8911A",
  accentBg: "rgba(212,130,30,0.10)",
  accentBorder: "rgba(212,130,30,0.35)",
  scrollTrack: "#1A1917",
  scrollThumb: "#363330",
  toggleOff: "#363330",
  green: "#4ade80",
  greenBg: "#0a1f10",
  greenBorder: "#1a4d25",
  red: "#f87171",
};

// ─── Static data ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "⊞", label: "Home", id: "home" },
  { icon: "🛒", label: "Orders", id: "orders" },
  { icon: "📖", label: "Menu", id: "menu" },
  { icon: "👤", label: "Customers", id: "customers" },
  { icon: "🏷️", label: "Discounts", id: "discounts" },
  { icon: "✕", label: "Cancellations", id: "cancellations" },
  { icon: "📡", label: "Broadcast", id: "broadcast" },
  { icon: "💬", label: "Inbox", id: "inbox", badge: 3 },
  { icon: "🚴", label: "Delivery", id: "delivery" },
  { icon: "⭐", label: "Reviews", id: "reviews", badge: 0 },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, t }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ background: value ? t.accent : t.toggleOff }}
      className="relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0"
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${value ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function ThemeBtn({ dark, onToggle, t }) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: t.surface2,
        border: `1px solid ${t.border2}`,
        color: t.subtle,
      }}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:opacity-80 active:scale-95 transition-all"
    >
      <span className="text-sm">{dark ? "☀️" : "🌙"}</span>
      <span
        className="text-xs font-medium hidden sm:inline"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        {dark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}

function Modal({ title, onClose, children, t }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          fontFamily: "'Lato', sans-serif",
        }}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div
          style={{ borderBottom: `1px solid ${t.border}` }}
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        >
          <p
            style={{ color: t.text, fontFamily: "'Cormorant Garamond', serif" }}
            className="text-xl font-bold tracking-wide"
          >
            {title}
          </p>
          <button
            onClick={onClose}
            style={{ color: t.subtle }}
            className="text-lg leading-none hover:opacity-60 transition-opacity w-8 h-8 flex items-center justify-center rounded-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, t }) {
  return (
    <div className="mb-5">
      <label
        style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
        className="text-xs font-semibold tracking-widest uppercase block mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: t.surface2,
          border: `1px solid ${t.border2}`,
          color: t.text,
          fontFamily: "'Lato', sans-serif",
        }}
        className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
      />
    </div>
  );
}

// ─── Drag hook ────────────────────────────────────────────────────────────────
function useTouchDrag(items, setItems, getId) {
  const itemRefs = useRef({});

  const drag = useRef({
    active: false,
    dragId: null,
    startY: 0,
    isDragging: false,
  });

  const setItemsRef = useRef(setItems);
  const getIdRef = useRef(getId);
  useEffect(() => {
    setItemsRef.current = setItems;
  }, [setItems]);
  useEffect(() => {
    getIdRef.current = getId;
  }, [getId]);

  const applyStyle = (id, on) => {
    const el = itemRefs.current[id];
    if (!el) return;
    el.style.opacity = on ? "0.45" : "";
    el.style.transform = on ? "scale(0.975)" : "";
    el.style.transition = on ? "none" : "";
    el.style.zIndex = on ? "20" : "";
  };

  useEffect(() => {
    const THRESHOLD = 6;

    const onMove = (e) => {
      const d = drag.current;
      if (!d.active) return;

      const dy = Math.abs(e.clientY - d.startY);

      if (!d.isDragging) {
        if (dy < THRESHOLD) return;
        d.isDragging = true;
        applyStyle(d.dragId, true);
      }

      e.preventDefault();

      const cy = e.clientY;
      let overId = null;
      for (const [id, el] of Object.entries(itemRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (cy >= r.top && cy <= r.bottom) {
          overId = id;
          break;
        }
      }

      if (overId && overId !== d.dragId) {
        setItemsRef.current((prev) => {
          const from = prev.findIndex((x) => getIdRef.current(x) === d.dragId);
          const to = prev.findIndex((x) => getIdRef.current(x) === overId);
          if (from === -1 || to === -1 || from === to) return prev;
          const next = [...prev];
          const [m] = next.splice(from, 1);
          next.splice(to, 0, m);
          return next;
        });
      }
    };

    const onEnd = () => {
      const d = drag.current;
      if (!d.active) return;
      if (d.isDragging) applyStyle(d.dragId, false);
      drag.current = {
        active: false,
        dragId: null,
        startY: 0,
        isDragging: false,
      };
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, []);

  const onPointerDown = useCallback((id, e) => {
    if (e.button && e.button !== 0) return;
    drag.current = {
      active: true,
      dragId: id,
      startY: e.clientY,
      isDragging: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  }, []);

  return { itemRefs, onPointerDown };
}

// ─── Analytics helpers ────────────────────────────────────────────────────────
function getPeriodRange(period, customStart, customEnd) {
  const now = new Date();
  const s = (d) => {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
  };
  const e = (d) => {
    const r = new Date(d);
    r.setHours(23, 59, 59, 999);
    return r;
  };
  if (period === "Today") return { from: s(now), to: e(now) };
  if (period === "Yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: s(y), to: e(y) };
  }
  if (period === "This Week") {
    const w = new Date(now);
    w.setDate(w.getDate() - w.getDay());
    return { from: s(w), to: e(now) };
  }
  if (period === "This Month")
    return {
      from: s(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: e(now),
    };
  if (period === "This Year")
    return { from: s(new Date(now.getFullYear(), 0, 1)), to: e(now) };
  if (period === "Custom")
    return {
      from: customStart ? s(new Date(customStart)) : s(now),
      to: customEnd ? e(new Date(customEnd)) : e(now),
    };
  return { from: s(now), to: e(now) };
}

const CHART_COLORS = [
  "#C4711A",
  "#2D7A4F",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
];

function fmtKDh(n) {
  return `KD ${Number(n || 0).toFixed(3)}`;
}

// ── Z-Report print ────────────────────────────────────────────────────────────
function printZReport({
  label,
  stats,
  topItems,
  topCustomers,
  payBreakdown,
  restaurant,
}) {
  const itemRows = topItems
    .map(
      (it, i) =>
        `<tr style="background:${i % 2 ? "#fafafa" : "#fff"}">
      <td style="padding:8px 12px">${i + 1}</td>
      <td style="padding:8px 12px">${it.name}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700">${it.qty}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700">KD ${Number(it.revenue || 0).toFixed(3)}</td>
    </tr>`,
    )
    .join("");
  const custRows = topCustomers
    .map(
      (c, i) =>
        `<tr style="background:${i % 2 ? "#fafafa" : "#fff"}">
      <td style="padding:8px 12px">${c.name || "—"}</td>
      <td style="padding:8px 12px;text-align:right">${c.orders}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700">KD ${Number(c.revenue).toFixed(3)}</td>
    </tr>`,
    )
    .join("");
  const payRows = payBreakdown
    .map(
      (p) =>
        `<tr><td style="padding:6px 12px">${p.method}</td><td style="padding:6px 12px;text-align:right">${p.count}</td><td style="padding:6px 12px;text-align:right;font-weight:700">KD ${Number(p.total).toFixed(3)}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Z-Report – ${label}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:40px;max-width:720px;margin:0 auto}
  h1{font-size:26px;font-weight:900;color:#C4711A;letter-spacing:-0.5px}
  h2{font-size:13px;font-weight:700;margin:28px 0 10px;color:#888;text-transform:uppercase;letter-spacing:.1em;border-top:1px solid #eee;padding-top:20px}
  .meta{font-size:12px;color:#999;margin-top:4px}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0}
  .kpi{background:#f9f6f2;border-radius:10px;padding:14px 16px}
  .kpi .val{font-size:20px;font-weight:800;color:#C4711A;margin-bottom:3px}
  .kpi .lbl{font-size:11px;color:#888}
  table{width:100%;border-collapse:collapse}
  thead th{background:#f0ece6;padding:9px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888}
  thead th:nth-child(n+3){text-align:right}
  tbody td{border-bottom:1px solid #f0f0f0}
  tfoot td{padding:10px 12px;font-weight:800;font-size:14px;color:#C4711A;border-top:2px solid #e0e0e0}
  tfoot td:last-child,tfoot td:nth-child(3){text-align:right}
  .footer{text-align:center;font-size:11px;color:#ccc;margin-top:40px;padding-top:20px;border-top:1px solid #eee}
  @media print{body{padding:20px}}</style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
    <div><h1>${restaurant?.name || "Restaurant"} — Z-Report</h1>
    <p class="meta">Period: ${label} &nbsp;·&nbsp; Generated ${new Date().toLocaleString()}</p></div>
  </div>
  <div class="kpi-grid">
    <div class="kpi"><div class="val">${stats.orders}</div><div class="lbl">Accepted orders</div></div>
    <div class="kpi"><div class="val">KD ${Number(stats.revenue).toFixed(3)}</div><div class="lbl">Total revenue</div></div>
    <div class="kpi"><div class="val">${stats.customers}</div><div class="lbl">Unique customers</div></div>
    <div class="kpi"><div class="val">${stats.rejected}</div><div class="lbl">Rejected</div></div>
    <div class="kpi"><div class="val">${stats.avgOrder}</div><div class="lbl">Avg order value</div></div>
    <div class="kpi"><div class="val">${stats.pending}</div><div class="lbl">Pending / open</div></div>
  </div>
  <h2>Payment Breakdown</h2>
  <table><thead><tr><th>Method</th><th>Orders</th><th>Total</th></tr></thead><tbody>${payRows || "<tr><td colspan='3' style='padding:12px;color:#aaa;text-align:center'>No data</td></tr>"}</tbody></table>
  <h2>Top Selling Items</h2>
  <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>${itemRows || "<tr><td colspan='4' style='padding:12px;color:#aaa;text-align:center'>No data</td></tr>"}</tbody>
    <tfoot><tr><td colspan="2">Total</td><td style="text-align:right">${topItems.reduce((s, i) => s + i.qty, 0)}</td><td style="text-align:right">KD ${topItems.reduce((s, i) => s + Number(i.revenue || 0), 0).toFixed(3)}</td></tr></tfoot>
  </table>
  <h2>Top Customers</h2>
  <table><thead><tr><th>Customer</th><th>Orders</th><th>Spent</th></tr></thead><tbody>${custRows || "<tr><td colspan='3' style='padding:12px;color:#aaa;text-align:center'>No data</td></tr>"}</tbody></table>
  <div class="footer">Ungrie &nbsp;·&nbsp; ${restaurant?.name || ""} &nbsp;·&nbsp; Z-Report</div>
  <script>window.onload=()=>window.print()</script></body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

// ── SVG Bar chart with hover tooltips ────────────────────────────────────────
function BarChart({
  data,
  color,
  height = 80,
  t,
  valuePrefix = "",
  valueSuffix = "",
}) {
  const [hovered, setHovered] = useState(null); // index
  if (!data || data.length === 0)
    return (
      <p
        style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
        className="text-sm text-center py-4"
      >
        No data
      </p>
    );
  const max = Math.max(...data.map((d) => d.v), 1);
  const W = 520,
    H = height,
    barW = Math.max(6, Math.floor(W / data.length) - 3);
  const LABEL_H = 20;
  const chartH = H - LABEL_H;
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: 260, width: "100%", height: "auto" }}
        preserveAspectRatio="none"
        onMouseLeave={() => setHovered(null)}
      >
        {data.map((d, i) => {
          const bh = Math.max(2, (d.v / max) * (chartH - 4));
          const x = (i / data.length) * W + 1;
          const isHov = hovered === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              style={{ cursor: "pointer" }}
            >
              {/* hover bg */}
              <rect
                x={x - 1}
                y={0}
                width={barW + 2}
                height={chartH}
                fill={isHov ? color + "18" : "transparent"}
                rx={2}
              />
              {/* bar */}
              <rect
                x={x}
                y={chartH - bh}
                width={barW}
                height={bh}
                rx={2}
                fill={color}
                opacity={isHov ? 1 : 0.78}
              />
              {/* day label */}
              {data.length <= 22 && (
                <text
                  x={x + barW / 2}
                  y={H - 2}
                  textAnchor="middle"
                  fontSize={7}
                  fill={isHov ? color : t.muted}
                  fontWeight={isHov ? "700" : "400"}
                >
                  {d.l}
                </text>
              )}
              {/* tooltip on hover */}
              {isHov && (
                <g>
                  {(() => {
                    const tx = Math.min(Math.max(x + barW / 2, 34), W - 34);
                    const ty = Math.max(chartH - bh - 8, 12);
                    const label = `${valuePrefix}${typeof d.v === "number" && d.v % 1 !== 0 ? d.v.toFixed(3) : d.v}${valueSuffix}`;
                    const tw = label.length * 5.8 + 10;
                    return (
                      <>
                        <rect
                          x={tx - tw / 2}
                          y={ty - 14}
                          width={tw}
                          height={18}
                          rx={4}
                          fill={color}
                        />
                        <text
                          x={tx}
                          y={ty - 2}
                          textAnchor="middle"
                          fontSize={8}
                          fill="#fff"
                          fontWeight="700"
                        >
                          {label}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── SVG Line + area chart with hover ─────────────────────────────────────────
function LineChart({ data, color, height = 110, t, valuePrefix = "KD " }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length < 2)
    return (
      <p
        style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
        className="text-sm text-center py-6"
      >
        Not enough data points
      </p>
    );
  const max = Math.max(...data.map((d) => d.v), 1);
  const W = 560,
    H = height,
    pad = { l: 38, r: 10, t: 18, b: 22 };
  const iw = W - pad.l - pad.r,
    ih = H - pad.t - pad.b;
  const step = iw / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({
    x: pad.l + i * step,
    y: pad.t + ih - (d.v / max) * ih,
    v: d.v,
    l: d.l,
  }));
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${pad.t + ih} ${pts.map((p) => `L${p.x},${p.y}`).join(" ")} L${pts[pts.length - 1].x},${pad.t + ih} Z`;
  const labelStep = Math.ceil(data.length / 8);
  const yTicks = [0, 0.5, 1].map((f) => ({
    v: max * f,
    y: pad.t + ih - f * ih,
  }));
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: 300, width: "100%", height: "auto" }}
        preserveAspectRatio="none"
        onMouseLeave={() => setHovered(null)}
      >
        {yTicks.map((yt, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              y1={yt.y}
              x2={W - pad.r}
              y2={yt.y}
              stroke={t.border}
              strokeWidth="0.7"
              strokeDasharray="3 3"
            />
            <text
              x={pad.l - 4}
              y={yt.y + 3}
              textAnchor="end"
              fontSize={7}
              fill={t.muted}
            >
              {yt.v >= 1 ? Math.round(yt.v) : yt.v.toFixed(2)}
            </text>
          </g>
        ))}
        <path d={area} fill={color} fillOpacity={0.08} />
        <polyline points={poly} fill="none" stroke={color} strokeWidth={2} />
        {pts.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            style={{ cursor: "crosshair" }}
          >
            <rect
              x={p.x - step / 2}
              y={pad.t}
              width={step}
              height={ih}
              fill="transparent"
            />
            {p.v > 0 && (
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 5 : 3}
                fill={color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            )}
          </g>
        ))}
        {pts
          .filter((_, i) => i % labelStep === 0 || i === pts.length - 1)
          .map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - 2}
              textAnchor="middle"
              fontSize={7}
              fill={t.muted}
            >
              {p.l}
            </text>
          ))}
        {hovered !== null &&
          pts[hovered] &&
          (() => {
            const p = pts[hovered];
            const label = `${valuePrefix}${p.v.toFixed(3)}`;
            const tw = label.length * 5.8 + 10;
            const tx = Math.min(
              Math.max(p.x, pad.l + tw / 2),
              W - pad.r - tw / 2,
            );
            const ty = Math.max(p.y - 10, 14);
            return (
              <g>
                <line
                  x1={p.x}
                  y1={pad.t}
                  x2={p.x}
                  y2={pad.t + ih}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                  opacity={0.5}
                />
                <rect
                  x={tx - tw / 2}
                  y={ty - 14}
                  width={tw}
                  height={18}
                  rx={4}
                  fill={color}
                />
                <text
                  x={tx}
                  y={ty - 2}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#fff"
                  fontWeight="700"
                >
                  {label}
                </text>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}

// ── Horizontal rank bars ───────────────────────────────────────────────────────
function RankBars({ items, color, t, emptyMsg = "No data for this period" }) {
  const max = items[0]?.value || 1;
  if (!items.length)
    return (
      <p
        style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
        className="text-sm text-center py-4"
      >
        {emptyMsg}
      </p>
    );
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            style={{
              color: t.muted,
              fontFamily: "'Lato', sans-serif",
              minWidth: 18,
            }}
            className="text-xs font-bold text-right flex-shrink-0"
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p
                style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                className="text-sm font-semibold truncate pr-2"
              >
                {it.name}
              </p>
              <span
                style={{ color, fontFamily: "'Lato', sans-serif" }}
                className="text-sm font-bold flex-shrink-0"
              >
                {it.displayValue ?? it.value}
              </span>
            </div>
            <div
              style={{ background: t.surface2 }}
              className="h-1.5 rounded-full overflow-hidden"
            >
              <div
                style={{
                  width: `${(it.value / max) * 100}%`,
                  background: color,
                }}
                className="h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;

  const [period, setPeriod] = useState("Today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [custFilter, setCustFilter] = useState("revenue"); // revenue | orders
  const [loading, setLoading] = useState(true);
  const [zBusy, setZBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  // analytics state
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    rejected: 0,
    pending: 0,
    avgOrder: "KD 0.000",
  });
  const [timeSeries, setTimeSeries] = useState([]); // [{l, v, orders}]
  const [topItems, setTopItems] = useState([]); // [{name, qty, revenue}]
  const [topCustomers, setTopCustomers] = useState([]); // [{name, orders, revenue}]
  const [payBreakdown, setPayBreakdown] = useState([]); // [{method, count, total}]
  const [topViewed, setTopViewed] = useState([]);
  const [topAdded, setTopAdded] = useState([]);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!restId) {
      setLoading(false);
      setErr("No restaurant linked to this account.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const { from, to } = getPeriodRange(period, customStart, customEnd);
      const fromISO = from.toISOString(),
        toISO = to.toISOString();

      // 1. Restaurant info (once)
      if (!restaurant) {
        const { data: r } = await supabase
          .from("Restaurants")
          .select("id,name,branch_name")
          .eq("id", restId)
          .maybeSingle();
        if (r) setRestaurant(r);
      }

      // 2. All orders in period for THIS restaurant
      const { data: orders, error: oErr } = await supabase
        .from("Orders")
        .select("id, status, total_amount, payment_method, cust_id, created_at")
        .eq("rest_id", restId)
        .gte("created_at", fromISO)
        .lte("created_at", toISO);
      if (oErr) throw oErr;

      // Classify
      const ACTIVE_STATUSES = [
        "accepted",
        "preparing",
        "on_the_way",
        "delivered",
      ];
      const accepted = (orders || []).filter((o) =>
        ACTIVE_STATUSES.includes(o.status),
      );
      const rejected = (orders || []).filter((o) => o.status === "rejected");
      const pending = (orders || []).filter((o) => o.status === "pending");
      const revenue = accepted.reduce(
        (s, o) => s + Number(o.total_amount || 0),
        0,
      );
      const uniqueCustomers = new Set(accepted.map((o) => o.cust_id)).size;
      const avgOrder = accepted.length
        ? (revenue / accepted.length).toFixed(3)
        : "0.000";

      setStats({
        orders: accepted.length,
        revenue,
        customers: uniqueCustomers,
        rejected: rejected.length,
        pending: pending.length,
        avgOrder: `KD ${avgOrder}`,
      });

      // 3. Payment breakdown
      const payMap = {};
      accepted.forEach((o) => {
        const m = o.payment_method || "Unknown";
        if (!payMap[m]) payMap[m] = { method: m, count: 0, total: 0 };
        payMap[m].count++;
        payMap[m].total += Number(o.total_amount || 0);
      });
      setPayBreakdown(Object.values(payMap).sort((a, b) => b.total - a.total));

      // 4. Time series — group accepted orders by LOCAL day (not UTC)
      const dayMap = {};
      accepted.forEach((o) => {
        // Convert to local date string to avoid UTC-vs-local off-by-one
        const localDate = new Date(o.created_at);
        const day = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
        if (!dayMap[day]) dayMap[day] = { v: 0, orders: 0 };
        dayMap[day].v += Number(o.total_amount || 0);
        dayMap[day].orders++;
      });
      setTimeSeries(
        Object.entries(dayMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([d, val]) => ({ l: d.slice(5), v: val.v, orders: val.orders })),
      );

      // 5. Top selling items
      if (accepted.length > 0) {
        const ids = accepted.map((o) => o.id);
        const { data: ois } = await supabase
          .from("Order_Items")
          .select("menu_id, quantity, subtotal, Menu(name)")
          .in("order_id", ids);

        const iMap = {};
        (ois || []).forEach((it) => {
          const id = it.menu_id,
            name = it.Menu?.name || "Unknown";
          if (!iMap[id]) iMap[id] = { name, qty: 0, revenue: 0 };
          iMap[id].qty += it.quantity;
          iMap[id].revenue += Number(it.subtotal || 0);
        });
        setTopItems(
          Object.values(iMap)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 10),
        );

        // 6. Top customers for THIS restaurant (via Orders.rest_id)
        const custIds = [...new Set(accepted.map((o) => o.cust_id))];
        const custMap = {};
        accepted.forEach((o) => {
          if (!custMap[o.cust_id])
            custMap[o.cust_id] = { orders: 0, revenue: 0 };
          custMap[o.cust_id].orders++;
          custMap[o.cust_id].revenue += Number(o.total_amount || 0);
        });
        if (custIds.length > 0) {
          const { data: custs } = await supabase
            .from("Customer")
            .select("id, cust_name, ph_num")
            .in("id", custIds);
          const nameMap = {};
          (custs || []).forEach((c) => {
            nameMap[c.id] = c.cust_name || c.ph_num || "Guest";
          });
          setTopCustomers(
            Object.entries(custMap)
              .map(([cid, v]) => ({ name: nameMap[cid] || "Guest", ...v }))
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 8),
          );
        }
      } else {
        setTopItems([]);
        setTopCustomers([]);
      }

      // 7. Menu events (views + add_to_cart)
      try {
        const { data: evts } = await supabase
          .from("Menu_Events")
          .select("menu_id, event_type, Menu(name)")
          .eq("rest_id", restId)
          .gte("created_at", fromISO)
          .lte("created_at", toISO);

        const vMap = {},
          aMap = {};
        (evts || []).forEach((ev) => {
          const id = ev.menu_id,
            name = ev.Menu?.name || "Unknown";
          if (ev.event_type === "view") {
            if (!vMap[id]) vMap[id] = { name, value: 0 };
            vMap[id].value++;
          } else if (ev.event_type === "add_to_cart") {
            if (!aMap[id]) aMap[id] = { name, value: 0 };
            aMap[id].value++;
          }
        });
        setTopViewed(
          Object.values(vMap)
            .sort((a, b) => b.value - a.value)
            .slice(0, 8),
        );
        setTopAdded(
          Object.values(aMap)
            .sort((a, b) => b.value - a.value)
            .slice(0, 8),
        );
      } catch {
        setTopViewed([]);
        setTopAdded([]);
      }
    } catch (e) {
      console.error("[analytics]", e);
      setErr(e.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [restId, period, customStart, customEnd]); // eslint-disable-line

  useEffect(() => {
    load();
  }, [load]);

  // ── Z-Report ───────────────────────────────────────────────────────────────
  const handleZReport = () => {
    setZBusy(true);
    const { from, to } = getPeriodRange(period, customStart, customEnd);
    const label = `${from.toLocaleDateString("en-KW")} – ${to.toLocaleDateString("en-KW")}`;
    printZReport({
      label,
      stats,
      topItems,
      topCustomers,
      payBreakdown,
      restaurant,
    });
    setTimeout(() => setZBusy(false), 800);
  };

  // ── Sorted customer list ────────────────────────────────────────────────────
  const sortedCustomers = [...topCustomers].sort((a, b) =>
    custFilter === "orders" ? b.orders - a.orders : b.revenue - a.revenue,
  );

  // ── Render helpers ─────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div
      style={{ background: t.surface2 }}
      className="h-5 rounded-lg animate-pulse w-20"
    />
  );

  // Ungrie savings = 20% of revenue
  const ungrieSavings = stats.revenue * 0.2;

  const KpiCard = ({ icon, label, value, sub, green, red, special, pulse }) => {
    // special = Ungrie card, pulse = pending warning
    const bg = special
      ? "linear-gradient(135deg, #C4711A 0%, #a85a10 100%)"
      : pulse && stats.pending > 0
        ? "#FEF2F2"
        : t.surface;
    const borderCol = special
      ? "transparent"
      : pulse && stats.pending > 0
        ? "#FECACA"
        : t.border;
    return (
      <div
        style={{
          background: bg,
          border: `1px solid ${borderCol}`,
          position: "relative",
          overflow: "hidden",
        }}
        className={`rounded-xl p-5 transition-all hover:shadow-md ${special ? "shadow-lg" : ""}`}
      >
        {/* Ungrie decorative ring */}
        {special && (
          <div
            style={{
              position: "absolute",
              top: -24,
              right: -24,
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
        )}
        <div className="flex items-start justify-between mb-4">
          <div
            style={{
              background: special
                ? "rgba(255,255,255,0.18)"
                : pulse && stats.pending > 0
                  ? "#FEF2F2"
                  : t.surface2,
              border: `1px solid ${special ? "rgba(255,255,255,0.25)" : borderCol}`,
            }}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          >
            {icon}
          </div>
          {pulse && stats.pending > 0 && !special && (
            <span
              style={{
                background: "#FEF2F2",
                color: "#B83232",
                border: "1px solid #FECACA",
                fontFamily: "'Lato', sans-serif",
              }}
              className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
            >
              Action needed
            </span>
          )}
          {sub && !pulse && (
            <span
              style={{
                color: green
                  ? t.green
                  : red
                    ? t.red
                    : special
                      ? "rgba(255,255,255,0.75)"
                      : t.muted,
                fontFamily: "'Lato', sans-serif",
              }}
              className="text-xs font-semibold mt-1"
            >
              {sub}
            </span>
          )}
        </div>
        {loading ? (
          <Skeleton />
        ) : (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: special ? "#fff" : t.text,
            }}
            className="text-3xl font-bold mb-1 leading-none"
          >
            {value}
          </p>
        )}
        <p
          style={{
            color: special
              ? "rgba(255,255,255,0.8)"
              : pulse && stats.pending > 0
                ? "#B83232"
                : t.subtle,
            fontFamily: "'Lato', sans-serif",
          }}
          className="text-xs leading-snug mt-2"
        >
          {label}
        </p>
        {special && (
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'Lato', sans-serif",
              marginTop: 6,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".06em",
            }}
          >
            SAVINGS THIS PERIOD · POWERED BY UNGRIE
          </p>
        )}
      </div>
    );
  };

  const Section = ({ title, children, action }) => (
    <div
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
      className="rounded-xl overflow-hidden"
    >
      <div
        style={{ borderBottom: `1px solid ${t.border}` }}
        className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
      >
        <p
          style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
          className="text-lg font-bold"
        >
          {title}
        </p>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const PERIODS = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "This Year",
    "Custom",
  ];

  return (
    <div className="p-5 md:p-8 max-w-6xl space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
            className="text-3xl md:text-4xl font-bold tracking-tight"
          >
            Dashboard
          </h1>
          <p
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-sm mt-0.5"
          >
            Restaurant analytics · {period}
          </p>
        </div>
        <button
          onClick={handleZReport}
          disabled={zBusy || loading}
          style={{
            background: t.accent,
            color: "#fff",
            fontFamily: "'Lato', sans-serif",
            opacity: zBusy || loading ? 0.6 : 1,
          }}
          className="text-xs font-semibold px-4 py-2.5 rounded-lg tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm flex-shrink-0"
        >
          {zBusy ? "Generating…" : "Z-Report 📋"}
        </button>
      </div>

      {/* Period tabs */}
      <div
        style={{ borderBottom: `1px solid ${t.border}` }}
        className="flex flex-wrap items-center justify-between gap-3 pb-0"
      >
        <div className="flex gap-0 overflow-x-auto scrollbar-none">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                color: period === p ? t.accent : t.subtle,
                borderBottomColor: period === p ? t.accent : "transparent",
                fontFamily: "'Lato', sans-serif",
              }}
              className="pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>
        {period === "Custom" && (
          <div className="flex items-center gap-2 pb-3 flex-wrap">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                color: t.text,
                fontFamily: "'Lato', sans-serif",
              }}
              className="text-xs rounded-lg px-3 py-2 outline-none"
            />
            <span style={{ color: t.muted }} className="text-xs">
              to
            </span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                color: t.text,
                fontFamily: "'Lato', sans-serif",
              }}
              className="text-xs rounded-lg px-3 py-2 outline-none"
            />
            <button
              onClick={load}
              style={{
                background: t.accent,
                color: "#fff",
                fontFamily: "'Lato', sans-serif",
              }}
              className="text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {err && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B83232",
            fontFamily: "'Lato', sans-serif",
          }}
          className="rounded-xl px-4 py-3 text-sm"
        >
          ⚠️ {err}
        </div>
      )}

      {/* KPI cards */}
      <div>
        <p
          style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
          className="text-xs font-bold tracking-widest uppercase mb-4"
        >
          Sales Overview
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KpiCard
            icon="✅"
            label="Accepted Orders"
            value={stats.orders}
            green
          />
          <KpiCard
            icon="💰"
            label="Total Revenue"
            value={fmtKDh(stats.revenue)}
            green
          />
          <KpiCard
            icon="👥"
            label="Unique Customers"
            value={stats.customers}
            green
          />
          <KpiCard icon="📊" label="Avg Order Value" value={stats.avgOrder} />
          <KpiCard
            icon="✕"
            label="Rejected Orders"
            value={stats.rejected}
            red
          />
          <KpiCard
            icon="⏳"
            label="Pending Orders"
            value={stats.pending}
            pulse
          />
          {/* Ungrie savings — full-width standout card */}
          <div className="col-span-2 sm:col-span-3">
            <KpiCard
              icon="✨"
              label="Revenue saved by using Ungrie"
              value={fmtKDh(ungrieSavings)}
              special
            />
          </div>
        </div>
      </div>

      {/* Revenue line chart */}
      <Section
        title="Revenue Over Time"
        action={
          timeSeries.length > 0 ? (
            <span
              style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
              className="text-xs"
            >
              {timeSeries.length} day{timeSeries.length !== 1 ? "s" : ""}
            </span>
          ) : null
        }
      >
        {loading ? (
          <div
            style={{
              height: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ color: t.muted }}>Loading…</p>
          </div>
        ) : (
          <LineChart data={timeSeries} color={t.accent} height={110} t={t} />
        )}
      </Section>

      {/* Top items + Top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section
          title="Top Selling Items"
          action={
            <span
              style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
              className="text-xs"
            >
              by qty sold
            </span>
          }
        >
          {loading ? (
            <p style={{ color: t.muted }}>Loading…</p>
          ) : (
            <RankBars
              items={topItems.map((it) => ({
                name: it.name,
                value: it.qty,
                displayValue: `${it.qty} sold`,
              }))}
              color={t.accent}
              t={t}
            />
          )}
        </Section>

        <Section
          title="Top Customers"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustFilter("revenue")}
                style={{
                  background:
                    custFilter === "revenue" ? t.accentBg : t.surface2,
                  border: `1px solid ${custFilter === "revenue" ? t.accentBorder : t.border2}`,
                  color: custFilter === "revenue" ? t.accent : t.subtle,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
              >
                Revenue
              </button>
              <button
                onClick={() => setCustFilter("orders")}
                style={{
                  background: custFilter === "orders" ? t.accentBg : t.surface2,
                  border: `1px solid ${custFilter === "orders" ? t.accentBorder : t.border2}`,
                  color: custFilter === "orders" ? t.accent : t.subtle,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
              >
                Orders
              </button>
            </div>
          }
        >
          {loading ? (
            <p style={{ color: t.muted }}>Loading…</p>
          ) : (
            <RankBars
              items={sortedCustomers.map((c) => ({
                name: c.name,
                value: custFilter === "orders" ? c.orders : c.revenue,
                displayValue:
                  custFilter === "orders"
                    ? `${c.orders} orders`
                    : fmtKDh(c.revenue),
              }))}
              color={t.green}
              t={t}
            />
          )}
        </Section>
      </div>

      {/* Payment breakdown */}
      {payBreakdown.length > 0 && !loading && (
        <Section title="Payment Methods">
          <div className="flex items-start gap-6 flex-wrap">
            <svg
              width={140}
              height={140}
              viewBox="0 0 140 140"
              className="flex-shrink-0"
            >
              {(() => {
                const total =
                  payBreakdown.reduce((s, p) => s + p.count, 0) || 1;
                let angle = -90;
                const cx = 70,
                  cy = 70,
                  r = 52,
                  thick = 20;
                const arcPath = (sd, ed) => {
                  const s = (sd * Math.PI) / 180,
                    e = (ed * Math.PI) / 180;
                  return `M${cx + r * Math.cos(s)},${cy + r * Math.sin(s)} A${r},${r} 0 ${ed - sd > 180 ? 1 : 0},1 ${cx + r * Math.cos(e)},${cy + r * Math.sin(e)}`;
                };
                return payBreakdown.map((p, i) => {
                  const pct = p.count / total;
                  const st = angle;
                  angle += pct * 360;
                  return pct > 0 ? (
                    <path
                      key={i}
                      d={arcPath(st, angle)}
                      fill="none"
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={thick}
                      strokeLinecap="butt"
                    />
                  ) : null;
                });
              })()}
              <text
                x="70"
                y="67"
                textAnchor="middle"
                fontSize={18}
                fontWeight={800}
                fill={t.text}
              >
                {payBreakdown.reduce((s, p) => s + p.count, 0)}
              </text>
              <text
                x="70"
                y="81"
                textAnchor="middle"
                fontSize={9}
                fill={t.muted}
              >
                orders
              </text>
            </svg>
            <div className="space-y-2.5 flex-1">
              {payBreakdown.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    />
                    <p
                      style={{
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-sm"
                    >
                      {p.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      style={{
                        color: t.muted,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs"
                    >
                      {p.count} orders
                    </span>
                    <span
                      style={{
                        color: t.accent,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-sm font-bold"
                    >
                      {fmtKDh(p.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Orders per day bar chart */}
      <Section
        title="Orders Per Day"
        action={
          <div className="flex items-center gap-2">
            <span
              style={{ background: t.accent }}
              className="w-4 h-0.5 inline-block rounded-full"
            />
            <p
              style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
              className="text-xs"
            >
              Revenue (KD)
            </p>
          </div>
        }
      >
        <div className="flex items-baseline gap-3 mb-4">
          {loading ? (
            <div
              style={{ background: t.surface2 }}
              className="h-8 w-20 rounded-lg animate-pulse"
            />
          ) : (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: t.text,
              }}
              className="text-3xl font-bold"
            >
              {stats.orders}
            </p>
          )}
          <p
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-sm"
          >
            accepted orders
          </p>
        </div>
        {loading ? (
          <div
            style={{ background: t.surface2, height: 80 }}
            className="rounded-lg animate-pulse"
          />
        ) : (
          <BarChart data={timeSeries} color={t.accent} height={80} t={t} />
        )}
      </Section>

      {/* Revenue by top item mini bars */}
      {topItems.length > 0 && !loading && (
        <Section title="Revenue by Item">
          <BarChart
            data={[...topItems]
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 8)
              .map((it) => ({
                l: it.name.length > 10 ? it.name.slice(0, 9) + "…" : it.name,
                full: it.name,
                v: it.revenue,
              }))}
            color={t.green}
            height={90}
            t={t}
            valuePrefix="KD "
          />
          {/* Full name legend — sorted by revenue */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...topItems]
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 8)
              .map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    style={{
                      background: t.green,
                      fontFamily: "'Lato', sans-serif",
                      minWidth: 20,
                      flexShrink: 0,
                    }}
                    className="text-xs text-white font-bold rounded px-1.5 py-0.5 text-center"
                  >
                    {i + 1}
                  </span>
                  <p
                    style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                    className="text-xs truncate"
                  >
                    {it.name}
                  </p>
                  <span
                    style={{
                      color: t.green,
                      fontFamily: "'Lato', sans-serif",
                      flexShrink: 0,
                      marginLeft: "auto",
                    }}
                    className="text-xs font-bold"
                  >
                    {fmtKDh(it.revenue)}
                  </span>
                </div>
              ))}
          </div>
        </Section>
      )}

      {/* Menu engagement */}
      <div>
        <p
          style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
          className="text-xs font-bold tracking-widest uppercase mb-4"
        >
          Menu Engagement
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Top Added to Cart",
              data: topAdded,
              color: "#F59E0B",
              note: "add events",
            },
            {
              title: "Top Viewed Items",
              data: topViewed,
              color: "#6366F1",
              note: "views",
            },
          ].map(({ title, data, color, note }) => (
            <Section
              key={title}
              title={title}
              action={
                <span
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs"
                >
                  {note}
                </span>
              }
            >
              {loading ? (
                <p style={{ color: t.muted }}>Loading…</p>
              ) : data.length === 0 ? (
                <div className="text-center py-2">
                  <p
                    style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                    className="text-sm mb-1"
                  >
                    No events yet
                  </p>
                  <p
                    style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                    className="text-xs opacity-60"
                  >
                    Events are tracked as customers browse
                  </p>
                </div>
              ) : (
                <RankBars items={data} color={color} t={t} />
              )}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Page ────────────────────────────────────────────────────────────
function DeliveryPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", active: true });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null); // kept for future but unused in UI
  const [formErr, setFormErr] = useState("");
  const [period, setPeriod] = useState("This Month");
  const [showInactive, setShowInactive] = useState(false);

  const fetchRiders = useCallback(async () => {
    if (!restId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Delivery_Riders")
        .select("*")
        .eq("rest_id", restId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRiders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restId]);

  const fetchStats = useCallback(async () => {
    if (!restId) return;
    setStatsLoading(true);
    try {
      const { from, to } = getPeriodRange(period, "", "");
      // Fetch orders with rider info
      const { data: orders } = await supabase
        .from("Orders")
        .select(
          "id, total_amount, status, delivery_rider_name, delivery_rider_phone, rider_id, cust_id, created_at",
        )
        .eq("rest_id", restId)
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .not("delivery_rider_name", "is", null);

      // Build stats keyed by rider_id (if exists) or name+phone combo
      const map = {};
      (orders || []).forEach((o) => {
        const key = o.rider_id
          ? `id_${o.rider_id}`
          : `anon_${o.delivery_rider_name}_${o.delivery_rider_phone}`;
        if (!map[key])
          map[key] = {
            rider_id: o.rider_id || null,
            name: o.delivery_rider_name || "Unknown",
            phone: o.delivery_rider_phone || "",
            orders: 0,
            revenue: 0,
            delivered: 0,
          };
        map[key].orders++;
        map[key].revenue += Number(o.total_amount || 0);
        if (o.status === "delivered") map[key].delivered++;
      });
      setStats(Object.values(map).sort((a, b) => b.orders - a.orders));
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, [restId, period]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openNew = () => {
    setForm({ name: "", phone: "", active: true });
    setEditingId(null);
    setFormErr("");
    setShowForm(true);
  };
  const openEdit = (r) => {
    setForm({ name: r.name, phone: r.phone, active: r.active });
    setEditingId(r.id);
    setFormErr("");
    setShowForm(true);
  };
  const cancelForm = () => {
    setShowForm(false);
    setFormErr("");
  };

  const saveRider = async () => {
    if (!form.name.trim()) {
      setFormErr("Name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setFormErr("Phone is required.");
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      if (editingId) {
        const { error } = await supabase
          .from("Delivery_Riders")
          .update({
            name: form.name.trim(),
            phone: form.phone.trim(),
            active: form.active,
          })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("Delivery_Riders").insert({
          rest_id: restId,
          name: form.name.trim(),
          phone: form.phone.trim(),
          active: form.active,
        });
        if (error) throw error;
      }
      await fetchRiders();
      setShowForm(false);
    } catch (e) {
      setFormErr(e.message || "Failed to save rider.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rider) => {
    await supabase
      .from("Delivery_Riders")
      .update({ active: !rider.active })
      .eq("id", rider.id);
    setRiders((prev) =>
      prev.map((r) => (r.id === rider.id ? { ...r, active: !r.active } : r)),
    );
  };

  const deleteRider = async (id) => {
    await supabase.from("Delivery_Riders").delete().eq("id", id);
    setRiders((prev) => prev.filter((r) => r.id !== id));
    setDelConfirm(null);
  };

  const STAT_PERIODS = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="p-5 md:p-8 max-w-5xl space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1
          style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Delivery Riders
        </h1>
        <div className="flex items-center gap-2">
          {/* Inactive riders button */}
          {(() => {
            const inactiveRiders = riders.filter((r) => !r.active);
            return inactiveRiders.length > 0 ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowInactive((v) => !v)}
                  style={{
                    background: t.surface2,
                    border: `1px solid ${t.border2}`,
                    color: t.subtle,
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="text-xs font-semibold px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                  <span style={{ opacity: 0.5 }}>🛵</span>
                  Inactive ({inactiveRiders.length})
                  <span style={{ fontSize: 9 }}>
                    {showInactive ? "▲" : "▼"}
                  </span>
                </button>
                {showInactive && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 49 }}
                      onClick={() => setShowInactive(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        zIndex: 50,
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        borderRadius: 14,
                        padding: 12,
                        minWidth: 260,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                      }}
                    >
                      <p
                        style={{
                          color: t.subtle,
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Inactive Riders
                      </p>
                      <div className="space-y-2">
                        {inactiveRiders.map((r) => (
                          <div
                            key={r.id}
                            style={{
                              background: t.surface2,
                              border: `1px solid ${t.border2}`,
                              opacity: 0.75,
                            }}
                            className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                          >
                            <div
                              style={{
                                background: t.surface,
                                border: `1px solid ${t.border2}`,
                                color: t.muted,
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                            >
                              {r.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                style={{
                                  color: t.text,
                                  fontFamily: "'Lato', sans-serif",
                                }}
                                className="text-sm font-semibold truncate"
                              >
                                {r.name}
                              </p>
                              <p
                                style={{
                                  color: t.muted,
                                  fontFamily: "'Lato', sans-serif",
                                }}
                                className="text-xs"
                              >
                                {r.phone}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                toggleActive(r);
                                setShowInactive(false);
                              }}
                              style={{
                                background: t.greenBg,
                                border: `1px solid ${t.greenBorder}`,
                                color: t.green,
                                fontFamily: "'Lato', sans-serif",
                                flexShrink: 0,
                              }}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                            >
                              Activate
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null;
          })()}
          {!showForm && (
            <button
              onClick={openNew}
              style={{
                background: t.accent,
                color: "#fff",
                fontFamily: "'Lato', sans-serif",
              }}
              className="text-xs font-semibold px-4 py-2.5 rounded-lg tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              + Add Rider
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
          className="rounded-xl p-5"
        >
          <p
            style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
            className="text-lg font-bold mb-4"
          >
            {editingId ? "Edit Rider" : "New Rider Profile"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                className="text-xs font-bold tracking-widest uppercase block mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, name: e.target.value }));
                  setFormErr("");
                }}
                placeholder="e.g. Mohammed Al-Rashidi"
                style={{
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  color: t.text,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              />
            </div>
            <div>
              <label
                style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                className="text-xs font-bold tracking-widest uppercase block mb-2"
              >
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => {
                  setForm((p) => ({ ...p, phone: e.target.value }));
                  setFormErr("");
                }}
                placeholder="+965 XXXX XXXX"
                style={{
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  color: t.text,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>
          {formErr && (
            <p
              style={{ color: t.red, fontFamily: "'Lato', sans-serif" }}
              className="text-sm mb-3"
            >
              ⚠️ {formErr}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={cancelForm}
              style={{
                border: `1px solid ${t.border2}`,
                color: t.subtle,
                fontFamily: "'Lato', sans-serif",
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              Cancel
            </button>
            <button
              onClick={saveRider}
              disabled={saving}
              style={{
                background: t.accent,
                color: "#fff",
                fontFamily: "'Lato', sans-serif",
                opacity: saving ? 0.7 : 1,
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Rider"}
            </button>
          </div>
        </div>
      )}

      {/* Active Riders list only */}
      {loading ? (
        <p
          style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
          className="text-sm"
        >
          Loading riders…
        </p>
      ) : riders.filter((r) => r.active).length === 0 && !showForm ? (
        <div
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
          className="rounded-xl p-10 text-center"
        >
          <div className="text-4xl mb-3 opacity-30">🛵</div>
          <p
            style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
            className="text-sm"
          >
            No active riders. Add a rider or activate an inactive one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {riders
            .filter((r) => r.active)
            .map((r) => (
              <div
                key={r.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
                className="rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap"
              >
                <div
                  style={{
                    background: t.accentBg,
                    border: `1px solid ${t.accentBorder}`,
                    color: t.accent,
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                >
                  {r.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      style={{
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-sm font-semibold"
                    >
                      {r.name}
                    </p>
                    {r.is_default && (
                      <span
                        style={{
                          background: t.accentBg,
                          color: t.accent,
                          border: `1px solid ${t.accentBorder}`,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                      >
                        Default
                      </span>
                    )}
                    <span
                      style={{
                        background: t.greenBg,
                        color: t.green,
                        border: `1px solid ${t.greenBorder}`,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      Active
                    </span>
                  </div>
                  <p
                    style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                    className="text-xs mt-0.5"
                  >
                    {r.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(r)}
                    style={{
                      color: t.subtle,
                      border: `1px solid ${t.border2}`,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-70 transition-opacity"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    style={{
                      color: t.accent,
                      border: `1px solid ${t.accentBorder}`,
                      background: t.accentBg,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Delivery Statistics */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <p
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-bold tracking-widest uppercase"
          >
            Delivery Statistics
          </p>
          <div className="flex gap-1 overflow-x-auto">
            {STAT_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  color: period === p ? t.accent : t.subtle,
                  background: period === p ? t.accentBg : "transparent",
                  border: `1px solid ${period === p ? t.accentBorder : t.border2}`,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {statsLoading ? (
          <p
            style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
            className="text-sm"
          >
            Loading stats…
          </p>
        ) : stats.length === 0 ? (
          <div
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
            className="rounded-xl p-8 text-center"
          >
            <p
              style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
              className="text-sm"
            >
              No delivery data for this period
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.map((s, i) => {
              const isProfiled = !!s.rider_id;
              const deliveryRate = s.orders
                ? Math.round((s.delivered / s.orders) * 100)
                : 0;
              return (
                <div
                  key={i}
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                  }}
                  className="rounded-xl p-4"
                >
                  <div className="flex items-start gap-3 mb-3 flex-wrap">
                    <div
                      style={{
                        background: isProfiled ? t.accentBg : t.surface2,
                        border: `1px solid ${isProfiled ? t.accentBorder : t.border2}`,
                        color: isProfiled ? t.accent : t.muted,
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    >
                      {(s.name[0] || "?").toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          style={{
                            color: t.text,
                            fontFamily: "'Lato', sans-serif",
                          }}
                          className="text-sm font-semibold"
                        >
                          {s.name}
                        </p>
                        {!isProfiled && (
                          <span
                            style={{
                              background: t.surface2,
                              color: t.muted,
                              border: `1px solid ${t.border2}`,
                              fontFamily: "'Lato', sans-serif",
                            }}
                            className="text-xs px-2 py-0.5 rounded-full"
                          >
                            One-time
                          </span>
                        )}
                      </div>
                      {s.phone && (
                        <p
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                          }}
                          className="text-xs"
                        >
                          {s.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Deliveries", value: s.orders },
                      {
                        label: "Delivered",
                        value: `${s.delivered} (${deliveryRate}%)`,
                      },
                      { label: "Revenue covered", value: fmtKDh(s.revenue) },
                    ].map(({ label, value }, j) => (
                      <div
                        key={j}
                        style={{
                          background: t.surface2,
                          border: `1px solid ${t.border}`,
                        }}
                        className="rounded-lg px-3 py-2.5 text-center"
                      >
                        <p
                          style={{
                            color: t.text,
                            fontFamily: "'Lato', sans-serif",
                          }}
                          className="text-sm font-bold"
                        >
                          {value}
                        </p>
                        <p
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                          }}
                          className="text-xs mt-0.5"
                        >
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Customer Flip Card ───────────────────────────────────────────────────────
function CustomerFlipCard({ customer, onClose, t, restId }) {
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [customerTagIds, setCustomerTagIds] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagErr, setTagErr] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!restId || !customer?.cust_id) {
      setTagsLoading(false);
      return;
    }
    (async () => {
      try {
        const [{ data: all }, { data: custT }] = await Promise.all([
          supabase
            .from("Tags")
            .select("id,name,color")
            .eq("rest_id", restId)
            .order("name"),
          supabase
            .from("Customer_Tags")
            .select("tag_id")
            .eq("cust_id", customer.cust_id)
            .eq("rest_id", restId),
        ]);
        setAllTags(all || []);
        setCustomerTagIds((custT || []).map((r) => r.tag_id));
      } catch {
        /* non-critical */
      } finally {
        setTagsLoading(false);
      }
    })();
  }, [restId, customer?.cust_id]);

  const toggleTag = async (tag) => {
    setTagErr("");
    const isIn = customerTagIds.includes(tag.id);
    if (isIn) {
      const { error } = await supabase
        .from("Customer_Tags")
        .delete()
        .eq("tag_id", tag.id)
        .eq("cust_id", customer.cust_id);
      if (!error) setCustomerTagIds((p) => p.filter((id) => id !== tag.id));
    } else {
      const { error } = await supabase
        .from("Customer_Tags")
        .insert({ tag_id: tag.id, cust_id: customer.cust_id, rest_id: restId });
      if (!error) setCustomerTagIds((p) => [...p, tag.id]);
      else if (!error?.message?.includes("unique"))
        setTagErr("Failed to add tag.");
    }
  };

  const handleClose = () => {
    setFlipped(false);
    setClosing(true);
    setTimeout(onClose, 400);
  };

  const c = customer;
  const initials = (c.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const avatarColors = [
    ["#C4711A", "#f5e6d3"],
    ["#2D7A4F", "#d4eddf"],
    ["#6366F1", "#e0e7ff"],
    ["#EC4899", "#fce7f3"],
    ["#14B8A6", "#ccfbf1"],
  ];
  const [accentColor, bgColor] =
    avatarColors[
      Math.abs((c.name || "").charCodeAt(0) || 0) % avatarColors.length
    ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: closing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.5)",
        backdropFilter: closing ? "blur(0px)" : "blur(6px)",
        transition: "background 0.4s, backdrop-filter 0.4s",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <style>{`
        .cust-flip-scene {
          width: 360px;
          max-width: 100%;
          height: 530px;
          perspective: 1200px;
        }
        @media (max-width: 400px) {
          .cust-flip-scene { height: 570px; width: 100%; }
        }
        .cust-flip-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .cust-flip-card.flipped {
          transform: rotateY(180deg);
        }
        .cust-flip-front,
        .cust-flip-back {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
        }
        .cust-flip-back {
          transform: rotateY(180deg);
        }
        @keyframes custSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cust-stat-row {
          animation: custSlideUp 0.35s ease forwards;
        }
        .cust-stat-row:nth-child(1) { animation-delay: 0.1s; opacity: 0; }
        .cust-stat-row:nth-child(2) { animation-delay: 0.18s; opacity: 0; }
        .cust-stat-row:nth-child(3) { animation-delay: 0.26s; opacity: 0; }
        .cust-stat-row:nth-child(4) { animation-delay: 0.34s; opacity: 0; }
        .cust-stat-row:nth-child(5) { animation-delay: 0.42s; opacity: 0; }
      `}</style>

      <div className="cust-flip-scene">
        <div className={`cust-flip-card ${flipped ? "flipped" : ""}`}>
          {/* FRONT — decorative placeholder shown briefly */}
          <div
            className="cust-flip-front"
            style={{
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
                fontFamily: "'Cormorant Garamond', serif",
                boxShadow: `0 8px 24px ${accentColor}55`,
              }}
            >
              {initials || "?"}
            </div>
            <p
              style={{
                color: accentColor,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {c.name}
            </p>
          </div>

          {/* BACK — full profile */}
          <div
            className="cust-flip-back"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header strip */}
            <div
              style={{
                background: accentColor,
                padding: "24px 24px 20px",
                position: "relative",
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "'Cormorant Garamond', serif",
                    border: "2px solid rgba(255,255,255,0.4)",
                    flexShrink: 0,
                  }}
                >
                  {initials || "?"}
                </div>
                <div>
                  <p
                    style={{
                      color: "#fff",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20,
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {c.name}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {c.phone !== "—" ? c.phone : "No phone on file"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
              {[
                {
                  icon: "🛒",
                  label: "Total Orders",
                  value: String(c.orders),
                  color: t.accent,
                },
                {
                  icon: "💰",
                  label: "Bill Total",
                  value: `KD ${Number(c.revenue || 0).toFixed(3)}`,
                  color: t.green,
                },
                {
                  icon: "📊",
                  label: "Avg Order Value",
                  value: `KD ${Number(c.avg || 0).toFixed(3)}`,
                  color: t.text,
                },
                {
                  icon: "📅",
                  label: "Joined On",
                  value: c.joined
                    ? new Date(c.joined).toLocaleDateString("en-KW", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                  color: t.text,
                },
                {
                  icon: "📡",
                  label: "Broadcast",
                  value:
                    c.broadcast === true
                      ? "Yes"
                      : c.broadcast === false
                        ? "No"
                        : "—",
                  color: c.broadcast ? t.green : t.muted,
                  badge: true,
                  badgeYes: c.broadcast === true,
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="cust-stat-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: idx < 4 ? `1px solid ${t.border}` : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 16 }}>{row.icon}</span>
                    <span
                      style={{
                        color: t.subtle,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 13,
                      }}
                    >
                      {row.label}
                    </span>
                  </div>
                  {row.badge ? (
                    <span
                      style={{
                        background: row.badgeYes ? t.greenBg : t.surface2,
                        border: `1px solid ${row.badgeYes ? t.greenBorder : t.border2}`,
                        color: row.badgeYes ? t.green : t.muted,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {row.value}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: row.color,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 17,
                        fontWeight: 800,
                      }}
                    >
                      {row.value}
                    </span>
                  )}
                </div>
              ))}

              {/* Tags — inside scrollable stats container */}
              <div style={{ paddingTop: 12, marginTop: 2 }}>
                <p
                  style={{
                    color: t.subtle,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Audience Tags
                </p>
                {tagsLoading ? (
                  <p style={{ color: t.muted, fontSize: 12 }}>Loading…</p>
                ) : allTags.length === 0 ? (
                  <p style={{ color: t.muted, fontSize: 12 }}>
                    No tags yet. Go to Broadcast to create tags.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {allTags.map((tag) => {
                      const isIn = customerTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: 99,
                            border: `1.5px solid ${tag.color}`,
                            background: isIn ? tag.color : "transparent",
                            color: isIn ? "#fff" : tag.color,
                            fontFamily: "'Lato', sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all .15s",
                          }}
                        >
                          {isIn ? "✓" : "+"} {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {tagErr && (
                  <p style={{ color: t.red, fontSize: 11, marginTop: 4 }}>
                    ⚠️ {tagErr}
                  </p>
                )}
              </div>
            </div>

            {/* Last order footer */}
            {c.lastOrder && (
              <div
                style={{
                  padding: "12px 24px",
                  borderTop: `1px solid ${t.border}`,
                  background: t.surface2,
                  borderRadius: "0 0 20px 20px",
                }}
              >
                <p
                  style={{
                    color: t.muted,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 11,
                    textAlign: "center",
                  }}
                >
                  Last order:{" "}
                  {new Date(c.lastOrder).toLocaleDateString("en-KW", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customers Page ───────────────────────────────────────────────────────────
function CustomersPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [topN, setTopN] = useState(50);
  const [topNInput, setTopNInput] = useState("50");
  const [sortBy, setSortBy] = useState("revenue"); // revenue | orders | joined
  const [sortDir, setSortDir] = useState("desc"); // asc | desc
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("All Customers"); // All Customers | Top Customers
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const load = useCallback(async () => {
    if (!restId) {
      setLoading(false);
      setErr("No restaurant linked.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const { data: orders, error: oErr } = await supabase
        .from("Orders")
        .select("id, cust_id, total_amount, status, created_at")
        .eq("rest_id", restId)
        .in("status", ["delivered", "accepted", "preparing", "on_the_way"]);
      if (oErr) throw oErr;

      const custMap = {};
      (orders || []).forEach((o) => {
        if (!custMap[o.cust_id])
          custMap[o.cust_id] = {
            cust_id: o.cust_id,
            orders: 0,
            revenue: 0,
            lastOrder: null,
          };
        custMap[o.cust_id].orders++;
        custMap[o.cust_id].revenue += Number(o.total_amount || 0);
        const d = new Date(o.created_at);
        if (
          !custMap[o.cust_id].lastOrder ||
          d > new Date(custMap[o.cust_id].lastOrder)
        ) {
          custMap[o.cust_id].lastOrder = o.created_at;
        }
      });

      const custIds = Object.keys(custMap);
      if (custIds.length === 0) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: pErr } = await supabase
        .from("Customer")
        .select("id, cust_name, ph_num, joined_on, broadcast")
        .in("id", custIds);
      if (pErr) throw pErr;

      const profileMap = {};
      (profiles || []).forEach((p) => {
        profileMap[p.id] = p;
      });

      const list = custIds.map((cid) => {
        const agg = custMap[cid];
        const prof = profileMap[cid] || {};
        return {
          ...agg,
          name: prof.cust_name || "—",
          phone: prof.ph_num || "—",
          joined: prof.joined_on || null,
          broadcast: prof.broadcast ?? null,
          avg: agg.orders > 0 ? agg.revenue / agg.orders : 0,
        };
      });

      setCustomers(list);
    } catch (e) {
      console.error("[CustomersPage]", e);
      setErr(e.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [restId]);

  useEffect(() => {
    load();
  }, [load]);

  const applyTopN = () => {
    const n = parseInt(topNInput, 10);
    if (!isNaN(n) && n > 0 && n <= 10000) setTopN(n);
    else setTopNInput(String(topN));
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const filtered = [...customers]
    .filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === "orders") diff = b.orders - a.orders;
      else if (sortBy === "joined") {
        diff =
          (b.joined ? new Date(b.joined).getTime() : 0) -
          (a.joined ? new Date(a.joined).getTime() : 0);
      } else {
        diff = b.revenue - a.revenue;
      }
      return sortDir === "desc" ? diff : -diff;
    })
    .slice(0, filterMode === "Top Customers" ? Math.min(topN, 50) : topN);

  const SortIcon = ({ col }) => {
    if (sortBy !== col)
      return (
        <span style={{ color: t.muted, opacity: 0.4, fontSize: 10 }}>⇅</span>
      );
    return (
      <span style={{ color: t.accent, fontSize: 10 }}>
        {sortDir === "desc" ? "↓" : "↑"}
      </span>
    );
  };

  const fmtJoined = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 1) return "Today";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const fmtJoinedFull = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-KW", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        padding: "24px 20px 40px",
        maxWidth: 1100,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <style>{`
        .cust-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 14px; }
        .cust-table { width: 100%; border-collapse: collapse; min-width: 640px; }
        .cust-table thead th {
          padding: 12px 14px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
        }
        .cust-table thead th:hover { opacity: 0.75; }
        .cust-table tbody tr {
          transition: background 0.15s;
          cursor: default;
        }
        .cust-table tbody tr:hover { filter: brightness(0.97); }
        .cust-table tbody td {
          padding: 13px 14px;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }
        .cust-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px;
          font-family: 'Cormorant Garamond', serif;
          flex-shrink: 0;
        }
        .cust-detail-btn {
          width: 28px; height: 28px; border-radius: 50%;
          border: none; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: transform 0.18s, opacity 0.18s;
          background: none;
        }
        .cust-detail-btn:hover { transform: scale(1.2); opacity: 0.8; }
        .cust-search-wrap { position: relative; }
        .cust-search-wrap input { padding-left: 36px !important; }
        .cust-search-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          font-size: 14px; pointer-events: none; opacity: 0.45;
        }
        @media (max-width: 500px) {
          .cust-table tbody td { padding: 11px 10px; font-size: 12px; }
          .cust-table thead th { padding: 10px 10px; font-size: 10px; }
        }
      `}</style>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: t.text,
              fontSize: "clamp(28px, 5vw, 38px)",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Customers
          </h1>
          <p
            style={{
              color: t.subtle,
              fontSize: 13,
              margin: "4px 0 0",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            {loading
              ? "Loading…"
              : `${customers.length} total · showing ${filtered.length}`}
          </p>
        </div>
        <button
          onClick={load}
          style={{
            background: t.surface2,
            border: `1px solid ${t.border2}`,
            color: t.subtle,
            fontFamily: "'Lato', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Refresh ↺
        </button>
      </div>

      {err && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B83232",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          ⚠️ {err}
        </div>
      )}

      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          className="cust-search-wrap"
          style={{
            flex: "1 1 200px",
            minWidth: 180,
            maxWidth: 340,
            position: "relative",
          }}
        >
          <span className="cust-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: t.surface,
              border: `1px solid ${t.border2}`,
              borderRadius: 10,
              padding: "9px 12px 9px 36px",
              color: t.text,
              fontSize: 13,
              outline: "none",
              fontFamily: "'Lato', sans-serif",
            }}
          />
        </div>

        {/* Filter mode */}
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          style={{
            background: t.surface,
            border: `1px solid ${t.border2}`,
            borderRadius: 10,
            padding: "9px 12px",
            color: t.text,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
            outline: "none",
          }}
        >
          <option>All Customers</option>
          <option>Top Customers</option>
        </select>

        {/* Show N */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
          }}
        >
          <span
            style={{
              color: t.subtle,
              fontSize: 12,
              whiteSpace: "nowrap",
              fontWeight: 600,
            }}
          >
            Show top
          </span>
          <input
            type="number"
            min={1}
            max={10000}
            value={topNInput}
            onChange={(e) => setTopNInput(e.target.value)}
            onBlur={applyTopN}
            onKeyDown={(e) => e.key === "Enter" && applyTopN()}
            style={{
              width: 64,
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              borderRadius: 8,
              padding: "7px 10px",
              color: t.text,
              fontSize: 13,
              textAlign: "center",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {[1, 2, 3, 4, 5].map((k) => (
            <div
              key={k}
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: t.surface2,
                  flexShrink: 0,
                }}
                className="animate-pulse"
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 13,
                    width: "45%",
                    background: t.surface2,
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                  className="animate-pulse"
                />
                <div
                  style={{
                    height: 10,
                    width: "28%",
                    background: t.surface2,
                    borderRadius: 6,
                  }}
                  className="animate-pulse"
                />
              </div>
              <div
                style={{
                  height: 13,
                  width: 60,
                  background: t.surface2,
                  borderRadius: 6,
                }}
                className="animate-pulse"
              />
              <div
                style={{
                  height: 13,
                  width: 80,
                  background: t.surface2,
                  borderRadius: 6,
                }}
                className="animate-pulse"
              />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 12 }}>👥</div>
          <p
            style={{ color: t.text, fontWeight: 700, fontSize: 15, margin: 0 }}
          >
            {search ? "No customers match your search" : "No customers yet"}
          </p>
          <p style={{ color: t.muted, fontSize: 13, marginTop: 6 }}>
            {search
              ? "Try a different name or phone number."
              : "Customers will appear once orders are placed."}
          </p>
        </div>
      ) : (
        <div
          className="cust-table-wrap"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <table className="cust-table">
            <thead
              style={{
                background: t.surface2,
                borderBottom: `2px solid ${t.border2}`,
              }}
            >
              <tr>
                <th style={{ color: t.subtle, paddingLeft: 20 }}>#</th>
                <th style={{ color: t.subtle }}>Customer Name</th>
                <th style={{ color: t.subtle }}>Phone Number</th>
                <th
                  style={{ color: sortBy === "orders" ? t.accent : t.subtle }}
                  onClick={() => toggleSort("orders")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Total Orders <SortIcon col="orders" />
                  </span>
                </th>
                <th
                  style={{ color: sortBy === "revenue" ? t.accent : t.subtle }}
                  onClick={() => toggleSort("revenue")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Bill Total <SortIcon col="revenue" />
                  </span>
                </th>
                <th style={{ color: t.subtle }}>Broadcast</th>
                <th
                  style={{ color: sortBy === "joined" ? t.accent : t.subtle }}
                  onClick={() => toggleSort("joined")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Joined On <SortIcon col="joined" />
                  </span>
                </th>
                <th style={{ color: t.subtle, textAlign: "center" }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const avatarColors = [
                  ["#C4711A", "#f5e6d3"],
                  ["#2D7A4F", "#d4eddf"],
                  ["#6366F1", "#e0e7ff"],
                  ["#EC4899", "#fce7f3"],
                  ["#14B8A6", "#ccfbf1"],
                ];
                const [ac, bgc] =
                  avatarColors[
                    Math.abs((c.name || "").charCodeAt(0) || 0) %
                      avatarColors.length
                  ];
                const isTop3 = filterMode === "Top Customers" && i < 3;
                const medalEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                return (
                  <tr
                    key={c.cust_id}
                    style={{
                      background: i % 2 === 0 ? t.surface : t.surface2 + "88",
                      borderBottom: `1px solid ${t.border}`,
                    }}
                  >
                    {/* Rank */}
                    <td
                      style={{
                        color: t.muted,
                        fontWeight: 700,
                        fontSize: 12,
                        paddingLeft: 20,
                        width: 48,
                      }}
                    >
                      {isTop3 ? medalEmoji : `#${i + 1}`}
                    </td>

                    {/* Name + avatar */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          className="cust-avatar"
                          style={{ background: bgc, color: ac, minWidth: 34 }}
                        >
                          {(c.name || "?")
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase() || "")
                            .join("") || "?"}
                        </div>
                        <span
                          style={{
                            color: t.text,
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {c.name}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ color: t.subtle }}>
                      {c.phone !== "—" ? (
                        c.phone
                      ) : (
                        <span style={{ color: t.muted, fontStyle: "italic" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Orders */}
                    <td>
                      <span
                        style={{
                          color: t.accent,
                          fontWeight: 800,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 16,
                        }}
                      >
                        {c.orders}
                      </span>
                    </td>

                    {/* Bill Total */}
                    <td>
                      <span
                        style={{
                          color: t.green,
                          fontWeight: 800,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 15,
                        }}
                      >
                        KD {Number(c.revenue || 0).toFixed(3)}
                      </span>
                    </td>

                    {/* Broadcast */}
                    <td>
                      {c.broadcast === true ? (
                        <span
                          style={{
                            background: t.greenBg,
                            border: `1px solid ${t.greenBorder}`,
                            color: t.green,
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Yes
                        </span>
                      ) : c.broadcast === false ? (
                        <span
                          style={{
                            background: t.surface2,
                            border: `1px solid ${t.border2}`,
                            color: t.muted,
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          No
                        </span>
                      ) : (
                        <span style={{ color: t.muted, fontStyle: "italic" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td>
                      <div>
                        <div
                          style={{
                            color: t.text,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {fmtJoined(c.joined)}
                        </div>
                        {c.joined && (
                          <div
                            style={{
                              color: t.muted,
                              fontSize: 11,
                              marginTop: 1,
                            }}
                          >
                            {fmtJoinedFull(c.joined)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Details button */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="cust-detail-btn"
                        onClick={() => setSelectedCustomer(c)}
                        style={{
                          color: t.accent,
                          background: t.accentBg,
                          border: `1px solid ${t.accentBorder}`,
                        }}
                        title="View customer details"
                      >
                        ℹ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Flip card overlay */}
      {selectedCustomer && (
        <CustomerFlipCard
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          t={t}
          restId={restId}
        />
      )}
    </div>
  );
}

// ─── Discounts Page ───────────────────────────────────────────────────────────
/*
  Requires two Supabase tables (run once):

  CREATE TABLE public.Discounts (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rest_id       bigint NOT NULL REFERENCES public.Restaurants(id),
    code          text NOT NULL,
    type          text NOT NULL CHECK (type IN ('percentage','fixed')),
    value         numeric NOT NULL,
    min_order     numeric NOT NULL DEFAULT 0,
    max_order     numeric,
    avail_from    date,
    expiry_date   date,
    is_active     boolean NOT NULL DEFAULT true,
    max_uses_per_customer integer NOT NULL DEFAULT 1,
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (rest_id, code)
  );

  CREATE TABLE public.Discount_Redemptions (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    discount_id   bigint NOT NULL REFERENCES public.Discounts(id),
    cust_id       bigint NOT NULL REFERENCES public.Customer(id),
    order_id      bigint REFERENCES public.Orders(id),
    amount_saved  numeric NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
  );
*/

function DiscountsPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;

  // ── state ──────────────────────────────────────────────────────────────────
  const [subPlan, setSubPlan] = useState(null); // 'Basic' | 'Premium' etc.
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // discount obj being edited, or null = new
  const [saving, setSaving] = useState(false);
  const [modalErr, setModalErr] = useState("");

  // redemptions drawer
  const [redeemDisc, setRedeemDisc] = useState(null); // discount to show redemptions for
  const [redemptions, setRedemptions] = useState([]);
  const [redeemLoading, setRedeemLoading] = useState(false);

  // form fields
  const emptyForm = {
    code: "",
    type: "percentage",
    value: "",
    min_order: "",
    max_order: "",
    avail_from: "",
    expiry_date: "",
    is_active: true,
    max_uses_per_customer: 1,
  };
  const [form, setForm] = useState(emptyForm);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── load restaurant plan + discounts ──────────────────────────────────────
  const load = useCallback(async () => {
    if (!restId) {
      setLoading(false);
      setErr("No restaurant linked.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      // fetch sub_plan
      const { data: rest } = await supabase
        .from("Restaurants")
        .select("sub_plan")
        .eq("id", restId)
        .maybeSingle();
      setSubPlan(rest?.sub_plan || "Basic");

      // fetch discounts + redemption stats in one go
      const { data: rows, error: dErr } = await supabase
        .from("Discounts")
        .select(
          `
          id, code, type, value, min_order, max_order,
          avail_from, expiry_date, is_active, max_uses_per_customer, created_at,
          Discount_Redemptions(id, amount_saved)
        `,
        )
        .eq("rest_id", restId)
        .order("created_at", { ascending: false });
      if (dErr) throw dErr;

      setDiscounts(rows || []);
    } catch (e) {
      console.error("[DiscountsPage]", e);
      setErr(e.message || "Failed to load discounts.");
    } finally {
      setLoading(false);
    }
  }, [restId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── computed helpers ───────────────────────────────────────────────────────
  const isExpired = (d) =>
    d?.expiry_date &&
    new Date(d.expiry_date) < new Date(new Date().toDateString());
  const isNotStarted = (d) =>
    d?.avail_from &&
    new Date(d.avail_from) > new Date(new Date().toDateString());

  const effectiveStatus = (d) => {
    if (!d.is_active) return "inactive";
    if (isExpired(d)) return "expired";
    if (isNotStarted(d)) return "scheduled";
    return "active";
  };

  const statusMeta = {
    active: {
      label: "Active",
      bg: "#dcfce7",
      color: "#15803d",
      border: "#bbf7d0",
    },
    inactive: {
      label: "Inactive",
      bg: "#f1f5f9",
      color: "#64748b",
      border: "#e2e8f0",
    },
    expired: {
      label: "Expired",
      bg: "#fee2e2",
      color: "#b91c1c",
      border: "#fecaca",
    },
    scheduled: {
      label: "Scheduled",
      bg: "#fef9c3",
      color: "#92400e",
      border: "#fde68a",
    },
  };

  const discountLabel = (d) =>
    d.type === "percentage"
      ? `${d.value}% off`
      : `KD ${Number(d.value).toFixed(3)} off`;

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase()),
  );

  // aggregate stats
  const totalStats = discounts.reduce(
    (acc, d) => {
      const reds = d.Discount_Redemptions || [];
      acc.redemptions += reds.length;
      acc.saved += reds.reduce((s, r) => s + Number(r.amount_saved || 0), 0);
      return acc;
    },
    { redemptions: 0, saved: 0 },
  );

  // ── open/close modal ───────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalErr("");
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      code: d.code,
      type: d.type,
      value: String(d.value),
      min_order: d.min_order != null ? String(d.min_order) : "",
      max_order: d.max_order != null ? String(d.max_order) : "",
      avail_from: d.avail_from || "",
      expiry_date: d.expiry_date || "",
      is_active: d.is_active,
      max_uses_per_customer: d.max_uses_per_customer ?? 1,
    });
    setModalErr("");
    setModalOpen(true);
  };

  // ── validate form ──────────────────────────────────────────────────────────
  const validate = () => {
    const code = form.code.trim().toUpperCase();
    if (!code) return "Discount code is required.";
    if (!/^[A-Z0-9_-]+$/.test(code))
      return "Code may only contain letters, numbers, _ and -.";
    const val = Number(form.value);
    if (!form.value || isNaN(val) || val <= 0)
      return "Discount value must be a positive number.";
    if (form.type === "percentage" && val > 100)
      return "Percentage cannot exceed 100%.";
    const minO = Number(form.min_order || 0);
    if (isNaN(minO) || minO < 0) return "Minimum order must be 0 or more.";
    if (form.type === "fixed" && val >= minO && minO > 0)
      return `Min. order (KD ${minO.toFixed(3)}) must be greater than the discount value (KD ${val.toFixed(3)}).`;
    if (form.type === "fixed" && minO === 0)
      return "For a fixed discount, please set a minimum order value greater than the discount amount.";
    if (form.max_order) {
      const maxO = Number(form.max_order);
      if (isNaN(maxO) || maxO <= 0)
        return "Max order must be a positive number.";
      if (maxO <= minO) return "Max order must be greater than min order.";
    }
    if (
      form.avail_from &&
      form.expiry_date &&
      form.avail_from > form.expiry_date
    )
      return "Available from date cannot be after expiry date.";
    const mup = Number(form.max_uses_per_customer);
    if (isNaN(mup) || mup < 1)
      return "Max uses per customer must be at least 1.";
    return null;
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    const validationError = validate();
    if (validationError) {
      setModalErr(validationError);
      return;
    }
    setSaving(true);
    setModalErr("");
    try {
      const payload = {
        rest_id: restId,
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_order: Number(form.min_order || 0),
        max_order: form.max_order ? Number(form.max_order) : null,
        avail_from: form.avail_from || null,
        expiry_date: form.expiry_date || null,
        is_active: form.is_active,
        max_uses_per_customer: Number(form.max_uses_per_customer),
      };
      if (editing) {
        const { error } = await supabase
          .from("Discounts")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("Discounts").insert(payload);
        if (error) {
          if (error.code === "23505")
            throw new Error(
              "A discount with this code already exists for your restaurant.",
            );
          throw error;
        }
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setModalErr(e.message || "Failed to save discount.");
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active (with expiry guard) ─────────────────────────────────────
  const toggleActive = async (d) => {
    // If trying to re-activate an expired code, block
    if (!d.is_active && isExpired(d)) {
      alert(
        "This code has expired. Please edit the expiry date before re-activating.",
      );
      return;
    }
    try {
      await supabase
        .from("Discounts")
        .update({ is_active: !d.is_active })
        .eq("id", d.id);
      setDiscounts((prev) =>
        prev.map((x) =>
          x.id === d.id ? { ...x, is_active: !x.is_active } : x,
        ),
      );
    } catch (e) {
      alert("Failed to update status: " + e.message);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const deleteDiscount = async (d) => {
    if (!window.confirm(`Delete code "${d.code}"? This cannot be undone.`))
      return;
    try {
      await supabase.from("Discounts").delete().eq("id", d.id);
      setDiscounts((prev) => prev.filter((x) => x.id !== d.id));
    } catch (e) {
      alert("Failed to delete: " + e.message);
    }
  };

  // ── load redemptions ───────────────────────────────────────────────────────
  const openRedemptions = async (d) => {
    setRedeemDisc(d);
    setRedeemLoading(true);
    try {
      const { data, error } = await supabase
        .from("Discount_Redemptions")
        .select(
          "id, amount_saved, created_at, cust_id, order_id, Customer(cust_name, ph_num)",
        )
        .eq("discount_id", d.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRedemptions(data || []);
    } catch (e) {
      setRedemptions([]);
    } finally {
      setRedeemLoading(false);
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-KW", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ── Premium gate ──────────────────────────────────────────────────────────
  if (!loading && subPlan === "Basic") {
    return (
      <div
        style={{
          padding: "40px 24px",
          maxWidth: 560,
          margin: "0 auto",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <style>{`
          @keyframes discFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          .disc-float { animation: discFloat 3s ease-in-out infinite; }
        `}</style>
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "48px 36px",
            textAlign: "center",
            boxShadow: `0 4px 24px ${t.accent}14`,
          }}
        >
          <div
            className="disc-float"
            style={{ fontSize: 64, marginBottom: 20 }}
          >
            🏷️
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: t.text,
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 10px",
            }}
          >
            Unlock Discount Codes
          </h2>
          <p
            style={{
              color: t.subtle,
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 28px",
            }}
          >
            Discount codes, promo campaigns, and coupon analytics are available
            on our
            <strong style={{ color: t.accent }}> Premium plan</strong>. Upgrade
            to start rewarding your customers and driving more orders.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            {[
              "Percentage & fixed discounts",
              "Per-customer usage limits",
              "Redemption analytics",
              "Expiry & availability dates",
              "Sales revenue tracking",
            ].map((f) => (
              <span
                key={f}
                style={{
                  background: t.accentBg,
                  border: `1px solid ${t.accentBorder}`,
                  color: t.accent,
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✓ {f}
              </span>
            ))}
          </div>
          <a
            href="/#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: t.accent,
              color: "#fff",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: `0 4px 16px ${t.accent}44`,
              transition: "opacity .2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            🚀 View Pricing Plans
          </a>
          <p style={{ color: t.muted, fontSize: 12, marginTop: 16 }}>
            You're currently on the <strong>Basic</strong> plan.
          </p>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: "24px 20px 60px",
        maxWidth: 1100,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <style>{`
        .disc-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .disc-table thead th {
          padding: 11px 14px; text-align: left;
          font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
          white-space: nowrap; cursor: default; user-select: none;
        }
        .disc-table tbody td { padding: 13px 14px; font-size: 13px; vertical-align: middle; }
        .disc-table tbody tr { border-bottom: 1px solid; transition: background .12s; }
        .disc-table tbody tr:last-child { border-bottom: none; }
        .disc-toggle { position:relative; width:42px; height:23px; cursor:pointer; }
        .disc-toggle input { opacity:0; width:0; height:0; position:absolute; }
        .disc-toggle-track {
          position:absolute; inset:0; border-radius:999px;
          transition:background .25s;
        }
        .disc-toggle-thumb {
          position:absolute; top:3px; left:3px;
          width:17px; height:17px; border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
          transition:transform .25s;
        }
        .disc-toggle input:checked + .disc-toggle-track { }
        .disc-modal-backdrop {
          position:fixed; inset:0; z-index:60;
          background:rgba(0,0,0,.45); backdrop-filter:blur(4px);
          display:flex; align-items:flex-end; justify-content:center;
        }
        @media(min-width:560px){ .disc-modal-backdrop { align-items:center; } }
        .disc-modal {
          width:100%; max-width:520px; max-height:92vh;
          border-radius:20px 20px 0 0; overflow:hidden; display:flex; flex-direction:column;
        }
        @media(min-width:560px){ .disc-modal { border-radius:20px; } }
        .disc-inp {
          width:100%; box-sizing:border-box; border-radius:10px;
          padding:10px 14px; font-size:13.5px; outline:none; transition:border .15s;
          font-family:'Lato',sans-serif;
        }
        .disc-inp:focus { box-shadow:0 0 0 3px rgba(196,113,26,.15); }
        .disc-select {
          width:100%; box-sizing:border-box; border-radius:10px;
          padding:10px 14px; font-size:13.5px; outline:none;
          font-family:'Lato',sans-serif; cursor:pointer;
          appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 12px center;
          padding-right:36px;
        }
        .disc-stat-card {
          border-radius:14px; padding:16px 20px; flex:1; min-width:130px;
        }
        .disc-redemption-row {
          display:flex; align-items:flex-start; gap:12px;
          padding:12px 0; border-bottom:1px solid;
        }
        .disc-redemption-row:last-child { border-bottom:none; }
        @keyframes discSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .disc-modal-anim { animation: discSlideUp .28s ease; }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              color: t.text,
              fontSize: "clamp(26px,5vw,36px)",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Discount Codes
          </h1>
          <p style={{ color: t.subtle, fontSize: 13, margin: "4px 0 0" }}>
            {loading
              ? "Loading…"
              : `${discounts.length} code${discounts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            background: t.accent,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: `0 4px 14px ${t.accent}44`,
          }}
        >
          + New Discount Code
        </button>
      </div>

      {err && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B83232",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          ⚠️ {err}
        </div>
      )}

      {/* ── Summary stat cards ── */}
      {!loading && (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Total Codes",
              value: discounts.length,
              icon: "🏷️",
              color: t.accent,
            },
            {
              label: "Active",
              value: discounts.filter((d) => effectiveStatus(d) === "active")
                .length,
              icon: "✅",
              color: t.green,
            },
            {
              label: "Total Redemptions",
              value: totalStats.redemptions,
              icon: "🔄",
              color: "#6366f1",
            },
            {
              label: "Total Savings Given",
              value: `KD ${totalStats.saved.toFixed(3)}`,
              icon: "💰",
              color: "#f59e0b",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="disc-stat-card"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  color: t.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search bar ── */}
      <div style={{ position: "relative", maxWidth: 320, marginBottom: 16 }}>
        <span
          style={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.4,
            fontSize: 15,
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search codes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: t.surface,
            border: `1px solid ${t.border2}`,
            borderRadius: 10,
            padding: "9px 12px 9px 34px",
            color: t.text,
            fontSize: 13,
            outline: "none",
            fontFamily: "'Lato',sans-serif",
          }}
        />
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                gap: 16,
              }}
            >
              {[140, 80, 100, 80, 70].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 13,
                    width: w,
                    background: t.surface2,
                    borderRadius: 6,
                  }}
                  className="animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 12 }}>🏷️</div>
          <p
            style={{ color: t.text, fontWeight: 700, fontSize: 15, margin: 0 }}
          >
            {search ? "No codes match your search" : "No discount codes yet"}
          </p>
          <p style={{ color: t.muted, fontSize: 13, marginTop: 6 }}>
            {search
              ? "Try a different search term."
              : "Click '+ New Discount Code' to create your first one."}
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 14,
            border: `1px solid ${t.border}`,
            background: t.surface,
          }}
        >
          <table className="disc-table">
            <thead
              style={{
                background: t.surface2,
                borderBottom: `2px solid ${t.border2}`,
              }}
            >
              <tr>
                {[
                  "Code",
                  "Type",
                  "Value",
                  "Min Order",
                  "Max Order",
                  "Availability",
                  "Expiry",
                  "Status",
                  "Uses/Cust",
                  "Redemptions",
                  "Sales",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={{ color: t.subtle }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((d, i) => {
                const status = effectiveStatus(d);
                const sm = statusMeta[status];
                const reds = d.Discount_Redemptions || [];
                const totalSaved = reds.reduce(
                  (s, r) => s + Number(r.amount_saved || 0),
                  0,
                );
                return (
                  <tr
                    key={d.id}
                    style={{
                      background: i % 2 === 0 ? t.surface : t.surface2 + "88",
                      borderBottomColor: t.border,
                    }}
                  >
                    {/* Code */}
                    <td>
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontWeight: 800,
                          fontSize: 16,
                          color: t.text,
                          letterSpacing: ".04em",
                        }}
                      >
                        {d.code}
                      </span>
                    </td>
                    {/* Type */}
                    <td>
                      <span
                        style={{
                          background:
                            d.type === "percentage" ? "#ede9fe" : "#dcfce7",
                          color:
                            d.type === "percentage" ? "#6d28d9" : "#15803d",
                          border: `1px solid ${d.type === "percentage" ? "#ddd6fe" : "#bbf7d0"}`,
                          borderRadius: 999,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {d.type === "percentage" ? "%" : "KD"}{" "}
                        {d.type === "percentage" ? "Percent" : "Fixed"}
                      </span>
                    </td>
                    {/* Value */}
                    <td
                      style={{
                        color: t.accent,
                        fontFamily: "'Cormorant Garamond',serif",
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      {discountLabel(d)}
                    </td>
                    {/* Min Order */}
                    <td style={{ color: t.subtle, fontSize: 12 }}>
                      {d.min_order
                        ? `KD ${Number(d.min_order).toFixed(3)}`
                        : "—"}
                    </td>
                    {/* Max Order */}
                    <td style={{ color: t.subtle, fontSize: 12 }}>
                      {d.max_order
                        ? `KD ${Number(d.max_order).toFixed(3)}`
                        : "—"}
                    </td>
                    {/* Availability */}
                    <td
                      style={{
                        color: t.subtle,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.avail_from ? fmtDate(d.avail_from) : "Immediately"}
                    </td>
                    {/* Expiry */}
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                      {d.expiry_date ? (
                        <span
                          style={{
                            color: isExpired(d) ? "#b91c1c" : t.text,
                            fontWeight: isExpired(d) ? 700 : 400,
                          }}
                        >
                          {isExpired(d) ? "⚠ " : ""}
                          {fmtDate(d.expiry_date)}
                        </span>
                      ) : (
                        <span style={{ color: t.muted }}>Never</span>
                      )}
                    </td>
                    {/* Status toggle */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <label
                          className="disc-toggle"
                          title={
                            isExpired(d) && !d.is_active
                              ? "Edit expiry date first"
                              : ""
                          }
                        >
                          <input
                            type="checkbox"
                            checked={d.is_active}
                            onChange={() => toggleActive(d)}
                          />
                          <div
                            className="disc-toggle-track"
                            style={{
                              background: d.is_active ? t.accent : t.toggleOff,
                            }}
                          />
                          <div
                            className="disc-toggle-thumb"
                            style={{
                              transform: d.is_active
                                ? "translateX(19px)"
                                : "translateX(0)",
                            }}
                          />
                        </label>
                        <span
                          style={{
                            background: sm.bg,
                            color: sm.color,
                            border: `1px solid ${sm.border}`,
                            borderRadius: 999,
                            padding: "2px 9px",
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sm.label}
                        </span>
                      </div>
                    </td>
                    {/* Max uses per customer */}
                    <td
                      style={{
                        color: t.text,
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {d.max_uses_per_customer}
                    </td>
                    {/* Redemptions */}
                    <td>
                      <button
                        onClick={() => openRedemptions(d)}
                        style={{
                          background: t.accentBg,
                          border: `1px solid ${t.accentBorder}`,
                          color: t.accent,
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'Lato',sans-serif",
                        }}
                      >
                        {reds.length} uses
                      </button>
                    </td>
                    {/* Sales */}
                    <td
                      style={{
                        color: t.green,
                        fontFamily: "'Cormorant Garamond',serif",
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      KD {totalSaved.toFixed(3)}
                    </td>
                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(d)}
                          style={{
                            background: t.surface2,
                            border: `1px solid ${t.border2}`,
                            borderRadius: 8,
                            width: 30,
                            height: 30,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: t.subtle,
                            fontSize: 14,
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteDiscount(d)}
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 8,
                            width: 30,
                            height: 30,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#b91c1c",
                            fontSize: 14,
                          }}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {modalOpen && (
        <div
          className="disc-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="disc-modal disc-modal-anim"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px 16px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: t.text,
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {editing ? "Edit Discount Code" : "New Discount Code"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  color: t.subtle,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {modalErr && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    marginBottom: 16,
                    fontWeight: 500,
                  }}
                >
                  ⚠️ {modalErr}
                </div>
              )}

              {/* Code */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: t.subtle,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 6,
                  }}
                >
                  Discount Code *
                </label>
                <input
                  className="disc-inp"
                  placeholder="e.g. SAVE20 or WELCOME"
                  value={form.code}
                  onChange={(e) => setF("code", e.target.value.toUpperCase())}
                  style={{
                    background: t.surface2,
                    border: `1.5px solid ${t.border2}`,
                    color: t.text,
                    fontFamily: "'Cormorant Garamond',serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: ".06em",
                  }}
                />
              </div>

              {/* Type + Value side by side */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.subtle,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Discount Type *
                  </label>
                  <select
                    className="disc-select"
                    value={form.type}
                    onChange={(e) => setF("type", e.target.value)}
                    style={{
                      background: t.surface2,
                      border: `1.5px solid ${t.border2}`,
                      color: t.text,
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (KD)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.subtle,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Value *{" "}
                    {form.type === "percentage"
                      ? "(e.g. 20 for 20%)"
                      : "(e.g. 1.500 for KD 1.500)"}
                  </label>
                  <input
                    className="disc-inp"
                    type="number"
                    min="0"
                    step={form.type === "percentage" ? "1" : "0.001"}
                    placeholder={form.type === "percentage" ? "20" : "1.500"}
                    value={form.value}
                    onChange={(e) => setF("value", e.target.value)}
                    style={{
                      background: t.surface2,
                      border: `1.5px solid ${t.border2}`,
                      color: t.text,
                    }}
                  />
                </div>
              </div>

              {/* Min / Max order */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.subtle,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Min. Order (KD) *
                  </label>
                  <input
                    className="disc-inp"
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="e.g. 3.000"
                    value={form.min_order}
                    onChange={(e) => setF("min_order", e.target.value)}
                    style={{
                      background: t.surface2,
                      border: `1.5px solid ${t.border2}`,
                      color: t.text,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.subtle,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Max. Order (KD){" "}
                    <span
                      style={{
                        textTransform: "none",
                        fontWeight: 400,
                        color: t.muted,
                      }}
                    >
                      optional
                    </span>
                  </label>
                  <input
                    className="disc-inp"
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="Leave blank for no max"
                    value={form.max_order}
                    onChange={(e) => setF("max_order", e.target.value)}
                    style={{
                      background: t.surface2,
                      border: `1.5px solid ${t.border2}`,
                      color: t.text,
                    }}
                  />
                </div>
              </div>

              {/* Avail from / Expiry */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.subtle,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Available From{" "}
                    <span
                      style={{
                        textTransform: "none",
                        fontWeight: 400,
                        color: t.muted,
                      }}
                    >
                      optional
                    </span>
                  </label>
                  <input
                    className="disc-inp"
                    type="date"
                    value={form.avail_from}
                    onChange={(e) => setF("avail_from", e.target.value)}
                    style={{
                      background: t.surface2,
                      border: `1.5px solid ${t.border2}`,
                      color: t.text,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.subtle,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Expiry Date{" "}
                    <span
                      style={{
                        textTransform: "none",
                        fontWeight: 400,
                        color: t.muted,
                      }}
                    >
                      optional
                    </span>
                  </label>
                  <input
                    className="disc-inp"
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setF("expiry_date", e.target.value)}
                    style={{
                      background: t.surface2,
                      border: `1.5px solid ${t.border2}`,
                      color: t.text,
                    }}
                  />
                </div>
              </div>

              {/* Max uses per customer */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: t.subtle,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 6,
                  }}
                >
                  Max Uses Per Customer *
                </label>
                <input
                  className="disc-inp"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={form.max_uses_per_customer}
                  onChange={(e) =>
                    setF("max_uses_per_customer", e.target.value)
                  }
                  style={{
                    background: t.surface2,
                    border: `1.5px solid ${t.border2}`,
                    color: t.text,
                    maxWidth: 120,
                  }}
                />
                <p style={{ color: t.muted, fontSize: 11, marginTop: 5 }}>
                  Each customer can use this code this many times. Set to 1 for
                  single-use per customer.
                </p>
              </div>

              {/* Active toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: t.surface2,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: t.text,
                      fontWeight: 700,
                      fontSize: 13,
                      margin: 0,
                    }}
                  >
                    Active
                  </p>
                  <p
                    style={{ color: t.muted, fontSize: 11, margin: "3px 0 0" }}
                  >
                    Customers can use this code when active.
                  </p>
                </div>
                <label className="disc-toggle">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setF("is_active", e.target.checked)}
                  />
                  <div
                    className="disc-toggle-track"
                    style={{
                      background: form.is_active ? t.accent : t.toggleOff,
                    }}
                  />
                  <div
                    className="disc-toggle-thumb"
                    style={{
                      transform: form.is_active
                        ? "translateX(19px)"
                        : "translateX(0)",
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${t.border}`,
                display: "flex",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  flex: 1,
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  borderRadius: 12,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: t.subtle,
                  cursor: "pointer",
                  fontFamily: "'Lato',sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 2,
                  background: t.accent,
                  border: "none",
                  borderRadius: 12,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  fontFamily: "'Lato',sans-serif",
                }}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Redemptions Drawer ── */}
      {redeemDisc && (
        <div
          className="disc-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRedeemDisc(null);
          }}
        >
          <div
            className="disc-modal disc-modal-anim"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <div
              style={{
                padding: "20px 24px 16px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    color: t.text,
                    fontSize: 20,
                    fontWeight: 800,
                    margin: "0 0 2px",
                  }}
                >
                  Redemptions —{" "}
                  <span style={{ color: t.accent }}>{redeemDisc.code}</span>
                </h2>
                <p style={{ color: t.muted, fontSize: 12, margin: 0 }}>
                  {discountLabel(redeemDisc)} · max{" "}
                  {redeemDisc.max_uses_per_customer} use
                  {redeemDisc.max_uses_per_customer !== 1 ? "s" : ""}/customer
                </p>
              </div>
              <button
                onClick={() => setRedeemDisc(null)}
                style={{
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  color: t.subtle,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
              {redeemLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: t.muted,
                  }}
                >
                  Loading…
                </div>
              ) : redemptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 10 }}>
                    🔄
                  </div>
                  <p style={{ color: t.muted, fontSize: 14 }}>
                    No redemptions yet for this code.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 18,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        background: t.accentBg,
                        border: `1px solid ${t.accentBorder}`,
                        borderRadius: 10,
                        padding: "10px 16px",
                      }}
                    >
                      <div
                        style={{
                          color: t.accent,
                          fontFamily: "'Cormorant Garamond',serif",
                          fontWeight: 800,
                          fontSize: 20,
                        }}
                      >
                        {redemptions.length}
                      </div>
                      <div
                        style={{
                          color: t.muted,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Total Uses
                      </div>
                    </div>
                    <div
                      style={{
                        background: t.greenBg,
                        border: `1px solid ${t.greenBorder}`,
                        borderRadius: 10,
                        padding: "10px 16px",
                      }}
                    >
                      <div
                        style={{
                          color: t.green,
                          fontFamily: "'Cormorant Garamond',serif",
                          fontWeight: 800,
                          fontSize: 20,
                        }}
                      >
                        KD{" "}
                        {redemptions
                          .reduce((s, r) => s + Number(r.amount_saved || 0), 0)
                          .toFixed(3)}
                      </div>
                      <div
                        style={{
                          color: t.muted,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Total Saved
                      </div>
                    </div>
                  </div>
                  {redemptions.map((r, i) => (
                    <div
                      key={r.id}
                      className="disc-redemption-row"
                      style={{ borderBottomColor: t.border }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: t.accentBg,
                          border: `1px solid ${t.accentBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: t.accent,
                          fontWeight: 800,
                          fontSize: 13,
                          fontFamily: "'Cormorant Garamond',serif",
                        }}
                      >
                        {(r.Customer?.cust_name || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: t.text,
                            fontWeight: 700,
                            fontSize: 13,
                            margin: "0 0 2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.Customer?.cust_name || "Unknown Customer"}
                        </p>
                        <p style={{ color: t.muted, fontSize: 11, margin: 0 }}>
                          {r.Customer?.ph_num || ""} · Order #
                          {r.order_id || "—"} · {fmtDate(r.created_at)}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            color: t.green,
                            fontFamily: "'Cormorant Garamond',serif",
                            fontWeight: 800,
                            fontSize: 15,
                          }}
                        >
                          −KD {Number(r.amount_saved || 0).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Broadcast Page ────────────────────────────────────────────────────────────
const TAG_PALETTE = [
  "#6366F1",
  "#C4711A",
  "#2D7A4F",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#10B981",
];

// Special audience definitions — computed from Orders/Customer data
const SPECIAL_AUDIENCES = [
  {
    id: "active",
    name: "Active Customers",
    icon: "⚡",
    desc: "Ordered in last 30 days",
    color: "#2D7A4F",
  },
  {
    id: "vip",
    name: "VIP Customers",
    icon: "👑",
    desc: "Top 20% by lifetime spend",
    color: "#F59E0B",
  },
  {
    id: "new",
    name: "New Customers",
    icon: "🌟",
    desc: "Joined & linked in last 30 days",
    color: "#6366F1",
  },
  {
    id: "inactive",
    name: "Inactive Customers",
    icon: "💤",
    desc: "No orders in 90+ days",
    color: "#9CA3AF",
  },
  {
    id: "opencart",
    name: "Open Cart Customers",
    icon: "🛒",
    desc: "Linked but no order in last 7 days",
    color: "#EC4899",
  },
  {
    id: "potential",
    name: "Potential Customers",
    icon: "🎯",
    desc: "Linked to restaurant, never ordered",
    color: "#14B8A6",
  },
  {
    id: "highavg",
    name: "High Avg Spend",
    icon: "💎",
    desc: "Avg order value > 2× restaurant avg",
    color: "#8B5CF6",
  },
  {
    id: "repeatbuyers",
    name: "Repeat Buyers",
    icon: "🔄",
    desc: "5 or more accepted orders placed",
    color: "#3B82F6",
  },
];

function BroadcastPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;
  const [activeTab, setActiveTab] = useState("audiences");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Page header + tab bar */}
      <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: t.text,
            fontSize: "clamp(26px,5vw,36px)",
            fontWeight: 800,
            margin: "0 0 20px",
          }}
        >
          Broadcast
        </h1>
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: `1.5px solid ${t.border}`,
          }}
        >
          {[
            ["schedule", "Schedule Broadcast"],
            ["audiences", "Audiences"],
            ["members", "Audience Members"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "10px 20px",
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === id ? t.text : t.muted,
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom:
                  activeTab === id
                    ? `2.5px solid ${t.text}`
                    : "2.5px solid transparent",
                background: "none",
                outline: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -1.5,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "schedule" && (
          <ScheduleBroadcastTab t={t} restId={restId} />
        )}
        {activeTab === "audiences" && <AudiencesTab t={t} restId={restId} />}
        {activeTab === "members" && (
          <AudienceMembersTab t={t} restId={restId} />
        )}
      </div>
    </div>
  );
}

// ─── SCHEDULE BROADCAST TAB ───────────────────────────────────────────────────
function ScheduleBroadcastTab({ t, restId }) {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [template, setTemplate] = useState({
    name: "",
    headerType: "text",
    headerText: "",
    headerImageUrl: "",
    body: "",
    footer: "Not interested? Type STOP to no longer receive updates.",
    buttons: [""],
    includeDiscount: false,
    discountCode: "",
  });
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [scheduleErr, setScheduleErr] = useState("");
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  useEffect(() => {
    if (!restId) return;
    (async () => {
      const [{ data: tData }, { data: tmpl }] = await Promise.all([
        supabase
          .from("Tags")
          .select("id,name,color")
          .eq("rest_id", restId)
          .order("name"),
        supabase
          .from("Broadcast_Templates")
          .select("*")
          .eq("rest_id", restId)
          .order("created_at", { ascending: false }),
      ]);
      setTags(tData || []);
      setSavedTemplates(tmpl || []);
      setTagsLoading(false);
      setTemplatesLoading(false);
    })();
  }, [restId]);

  const allAudiences = [
    ...SPECIAL_AUDIENCES.map((s) => ({
      id: `special_${s.id}`,
      name: s.name,
      icon: s.icon,
      color: s.color,
      special: true,
    })),
    ...(tags || []).map((tg) => ({
      id: `tag_${tg.id}`,
      name: tg.name,
      icon: "🏷️",
      color: tg.color,
      special: false,
      tag_id: tg.id,
    })),
  ];

  const toggleAudience = (id) =>
    setSelectedAudiences((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const saveTemplate = async () => {
    if (!template.name.trim()) {
      setScheduleErr("Template name is required.");
      return;
    }
    if (!template.body.trim()) {
      setScheduleErr("Message body is required.");
      return;
    }
    setScheduling(true);
    setScheduleErr("");
    try {
      const { error } = await supabase.from("Broadcast_Templates").insert({
        rest_id: restId,
        name: template.name.trim().toLowerCase().replace(/\s+/g, "_"),
        header_type: template.headerType,
        header_text: template.headerText || null,
        header_image_url: template.headerImageUrl || null,
        body: template.body,
        footer: template.footer,
        buttons: template.buttons.filter(Boolean),
        include_discount: template.includeDiscount,
        discount_code: template.discountCode || null,
      });
      if (error) throw error;
      setScheduleSuccess(
        "Template saved! To send via WhatsApp Business API, submit this template for approval in your WhatsApp Business Manager.",
      );
      setShowCreateTemplate(false);
      setTemplate({
        name: "",
        headerType: "text",
        headerText: "",
        headerImageUrl: "",
        body: "",
        footer: "Not interested? Type STOP to no longer receive updates.",
        buttons: [""],
        includeDiscount: false,
        discountCode: "",
      });
      const { data } = await supabase
        .from("Broadcast_Templates")
        .select("*")
        .eq("rest_id", restId)
        .order("created_at", { ascending: false });
      setSavedTemplates(data || []);
    } catch (e) {
      setScheduleErr(e.message || "Failed to save template.");
    } finally {
      setScheduling(false);
    }
  };

  const FieldLabel = ({ children, sub }) => (
    <div style={{ marginBottom: 6 }}>
      <label
        style={{
          color: t.subtle,
          fontFamily: "'Lato', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          display: "block",
        }}
      >
        {children}
      </label>
      {sub && (
        <p
          style={{
            color: t.muted,
            fontFamily: "'Lato', sans-serif",
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1000 }}>
      {scheduleSuccess && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #B8DEC9",
            color: "#2D7A4F",
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ✅ {scheduleSuccess}
        </div>
      )}
      {scheduleErr && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B83232",
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠️ {scheduleErr}
        </div>
      )}

      {/* Saved templates grid */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: t.text,
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Message Templates
          </p>
          <button
            onClick={() => setShowCreateTemplate(true)}
            style={{
              background: t.text,
              color: t.surface,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
          >
            + Create Template
          </button>
        </div>

        {templatesLoading ? (
          <p style={{ color: t.muted, fontSize: 13 }}>Loading templates…</p>
        ) : savedTemplates.length === 0 ? (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "32px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 10, opacity: 0.2 }}>
              📨
            </div>
            <p
              style={{
                color: t.muted,
                fontSize: 14,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              No templates yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {savedTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Template card header */}
                <div
                  style={{
                    padding: "14px 16px 10px",
                    borderBottom: `1px solid ${t.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        color: t.text,
                        fontWeight: 700,
                        fontSize: 14,
                        wordBreak: "break-all",
                      }}
                    >
                      {tmpl.name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      <span
                        style={{
                          background: t.greenBg,
                          color: t.green,
                          border: `1px solid ${t.greenBorder}`,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontFamily: "'Lato',sans-serif",
                        }}
                      >
                        Saved
                      </span>
                      <span
                        style={{
                          background: t.surface2,
                          color: t.muted,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontFamily: "'Lato',sans-serif",
                        }}
                      >
                        {tmpl.header_type || "TEXT"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Preview */}
                <div
                  style={{
                    padding: "12px 16px",
                    flex: 1,
                    background: "#FAFAF8",
                    maxHeight: 150,
                    overflow: "hidden",
                  }}
                >
                  {tmpl.header_text && (
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: t.text,
                        marginBottom: 4,
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {tmpl.header_text}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: 12,
                      color: "#444",
                      lineHeight: 1.5,
                      fontFamily: "Arial, sans-serif",
                      overflow: "hidden",
                    }}
                  >
                    {tmpl.body}
                  </p>
                </div>
                {/* Meta */}
                <div
                  style={{
                    padding: "8px 16px",
                    borderTop: `1px solid ${t.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {[
                    ["Header:", tmpl.header_type?.toUpperCase() || "—"],
                    [
                      "Body:",
                      (tmpl.body || "").slice(0, 50) +
                        ((tmpl.body || "").length > 50 ? "…" : ""),
                    ],
                    [
                      "Footer:",
                      (tmpl.footer || "—").slice(0, 40) +
                        ((tmpl.footer || "").length > 40 ? "…" : ""),
                    ],
                    ["Buttons:", (tmpl.buttons || []).length + " button(s)"],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          color: t.text,
                          fontFamily: "'Lato',sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          minWidth: 50,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          color: t.muted,
                          fontFamily: "'Lato',sans-serif",
                          fontSize: 11,
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Send button */}
                <button
                  onClick={() => {
                    if (selectedAudiences.length === 0) {
                      setScheduleErr(
                        "Select at least one audience tag below to send to.",
                      );
                      return;
                    }
                    setScheduleSuccess(
                      `"${tmpl.name}" queued for ${selectedAudiences.length} audience(s). Send via WhatsApp Business API.`,
                    );
                  }}
                  style={{
                    background: t.text,
                    color: t.surface,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "13px 0",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  📤 Send Broadcast
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audience selector */}
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: t.text,
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Select Audiences to Broadcast to
          {selectedAudiences.length > 0 && (
            <span
              style={{
                color: t.accent,
                fontFamily: "'Lato',sans-serif",
                fontSize: 13,
                fontWeight: 600,
                marginLeft: 10,
              }}
            >
              {selectedAudiences.length} selected
            </span>
          )}
        </p>
        {tagsLoading ? (
          <p style={{ color: t.muted, fontSize: 13 }}>Loading…</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {allAudiences.map((aud) => {
              const sel = selectedAudiences.includes(aud.id);
              return (
                <button
                  key={aud.id}
                  onClick={() => toggleAudience(aud.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 99,
                    border: `1.5px solid ${sel ? aud.color : t.border2}`,
                    background: sel ? aud.color + "18" : t.surface2,
                    color: sel ? aud.color : t.subtle,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <span>{aud.icon}</span>
                  {aud.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <>
          <div
            onClick={() => setShowCreateTemplate(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: "16px",
              zIndex: 201,
              background: t.surface,
              borderRadius: 16,
              overflow: "auto",
              maxWidth: 680,
              margin: "auto",
              height: "fit-content",
              maxHeight: "calc(100dvh - 32px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: "24px 28px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: t.text,
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Create Template
              </p>
              <button
                onClick={() => setShowCreateTemplate(false)}
                style={{
                  background: t.surface2,
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 18,
                  color: t.subtle,
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Template Details */}
              <div
                style={{
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: t.text,
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 16,
                    borderBottom: `1px solid ${t.border}`,
                    paddingBottom: 10,
                  }}
                >
                  Template Details
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <FieldLabel sub="Only lowercase letters, numbers and underscores. Spaces → underscores.">
                      Template Name
                    </FieldLabel>
                    <input
                      value={template.name}
                      onChange={(e) =>
                        setTemplate((p) => ({
                          ...p,
                          name: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_\s]/g, "")
                            .replace(/\s/g, "_"),
                        }))
                      }
                      placeholder="e.g. discount_offer"
                      maxLength={50}
                      style={{
                        width: "100%",
                        background: t.surface2,
                        border: `1px solid ${t.border2}`,
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <FieldLabel>Language</FieldLabel>
                    <select
                      style={{
                        width: "100%",
                        background: t.surface2,
                        border: `1px solid ${t.border2}`,
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <option>English</option>
                      <option>Arabic</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <FieldLabel>Header Type</FieldLabel>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["text", "image", "pdf", "none"].map((ht) => (
                      <label
                        key={ht}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 13,
                          color: t.text,
                          border: `1.5px solid ${template.headerType === ht ? t.accent : t.border2}`,
                          padding: "8px 14px",
                          borderRadius: 8,
                          background:
                            template.headerType === ht
                              ? t.accentBg
                              : t.surface2,
                        }}
                      >
                        <input
                          type="radio"
                          checked={template.headerType === ht}
                          onChange={() =>
                            setTemplate((p) => ({ ...p, headerType: ht }))
                          }
                          style={{ accentColor: t.accent }}
                        />
                        {ht.charAt(0).toUpperCase() + ht.slice(1)}
                        {ht === "text" ? " Only" : ""}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Header Content */}
              {(template.headerType === "text" ||
                template.headerType === "image") && (
                <div
                  style={{
                    border: `1px solid ${t.border}`,
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: t.text,
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 14,
                      borderBottom: `1px solid ${t.border}`,
                      paddingBottom: 10,
                    }}
                  >
                    Header Content
                  </p>
                  {template.headerType === "text" ? (
                    <div>
                      <FieldLabel>Header Text</FieldLabel>
                      <input
                        value={template.headerText}
                        onChange={(e) =>
                          setTemplate((p) => ({
                            ...p,
                            headerText: e.target.value,
                          }))
                        }
                        placeholder="Enter Header Text"
                        maxLength={60}
                        style={{
                          width: "100%",
                          background: t.surface2,
                          border: `1px solid ${t.border2}`,
                          color: t.text,
                          fontFamily: "'Lato', sans-serif",
                          padding: "10px 12px",
                          borderRadius: 8,
                          fontSize: 13,
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        onClick={() =>
                          setTemplate((p) => ({
                            ...p,
                            headerText: p.headerText + "{{1}}",
                          }))
                        }
                        style={{
                          marginTop: 8,
                          background: t.surface2,
                          border: `1px solid ${t.border2}`,
                          color: t.subtle,
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 11,
                          padding: "5px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        + Add Variable
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FieldLabel>Image URL</FieldLabel>
                      <input
                        value={template.headerImageUrl}
                        onChange={(e) =>
                          setTemplate((p) => ({
                            ...p,
                            headerImageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://…"
                        style={{
                          width: "100%",
                          background: t.surface2,
                          border: `1px solid ${t.border2}`,
                          color: t.text,
                          fontFamily: "'Lato', sans-serif",
                          padding: "10px 12px",
                          borderRadius: 8,
                          fontSize: 13,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Message Body */}
              <div
                style={{
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: t.text,
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 14,
                    borderBottom: `1px solid ${t.border}`,
                    paddingBottom: 10,
                  }}
                >
                  Message Body
                </p>
                <FieldLabel sub="Use {{1}}, {{2}} etc. as variable placeholders">
                  Message Body
                </FieldLabel>
                <textarea
                  value={template.body}
                  onChange={(e) =>
                    setTemplate((p) => ({ ...p, body: e.target.value }))
                  }
                  rows={5}
                  placeholder="Enter your message body…"
                  maxLength={1024}
                  style={{
                    width: "100%",
                    background: t.surface2,
                    border: `1px solid ${t.border2}`,
                    color: t.text,
                    fontFamily: "Arial, sans-serif",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {["Add Variable", "Bold", "Italic"].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === "Add Variable")
                          setTemplate((p) => ({
                            ...p,
                            body:
                              p.body +
                              " {{" +
                              ((p.body.match(/{{(\d+)}}/g) || []).length + 1 ||
                                1) +
                              "}}",
                          }));
                        if (btn === "Bold")
                          setTemplate((p) => ({
                            ...p,
                            body: p.body + " *text*",
                          }));
                        if (btn === "Italic")
                          setTemplate((p) => ({
                            ...p,
                            body: p.body + " _text_",
                          }));
                      }}
                      style={{
                        background: t.surface2,
                        border: `1px solid ${t.border2}`,
                        color: t.subtle,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 11,
                        padding: "5px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      + {btn}
                    </button>
                  ))}
                </div>
                <p style={{ color: t.muted, fontSize: 11, marginTop: 6 }}>
                  {template.body.length}/1024 characters
                </p>
              </div>

              {/* Footer + Buttons */}
              <div
                style={{
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: t.text,
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 14,
                    borderBottom: `1px solid ${t.border}`,
                    paddingBottom: 10,
                  }}
                >
                  Footer & Buttons
                </p>
                <FieldLabel>Footer Text (optional)</FieldLabel>
                <input
                  value={template.footer}
                  onChange={(e) =>
                    setTemplate((p) => ({ ...p, footer: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    background: t.surface2,
                    border: `1px solid ${t.border2}`,
                    color: t.text,
                    fontFamily: "'Lato', sans-serif",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    boxSizing: "border-box",
                    marginBottom: 14,
                  }}
                />
                <FieldLabel>Call-to-Action Buttons (max 3)</FieldLabel>
                {template.buttons.map((btn, bi) => (
                  <div
                    key={bi}
                    style={{ display: "flex", gap: 8, marginBottom: 6 }}
                  >
                    <input
                      value={btn}
                      onChange={(e) =>
                        setTemplate((p) => ({
                          ...p,
                          buttons: p.buttons.map((b, i) =>
                            i === bi ? e.target.value : b,
                          ),
                        }))
                      }
                      placeholder={`Button ${bi + 1} text`}
                      maxLength={25}
                      style={{
                        flex: 1,
                        background: t.surface2,
                        border: `1px solid ${t.border2}`,
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                    <button
                      onClick={() =>
                        setTemplate((p) => ({
                          ...p,
                          buttons: p.buttons.filter((_, i) => i !== bi),
                        }))
                      }
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#B83232",
                        borderRadius: 6,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {template.buttons.length < 3 && (
                  <button
                    onClick={() =>
                      setTemplate((p) => ({
                        ...p,
                        buttons: [...p.buttons, ""],
                      }))
                    }
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.subtle,
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12,
                      padding: "7px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    + Add Button
                  </button>
                )}
                {/* Discount code toggle */}
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    id="incDisc"
                    checked={template.includeDiscount}
                    onChange={(e) =>
                      setTemplate((p) => ({
                        ...p,
                        includeDiscount: e.target.checked,
                      }))
                    }
                    style={{ accentColor: t.accent, width: 16, height: 16 }}
                  />
                  <label
                    htmlFor="incDisc"
                    style={{
                      color: t.text,
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Include discount code in message
                  </label>
                </div>
                {template.includeDiscount && (
                  <input
                    value={template.discountCode}
                    onChange={(e) =>
                      setTemplate((p) => ({
                        ...p,
                        discountCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. WOMEN20"
                    style={{
                      marginTop: 8,
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.text,
                      fontFamily: "'Courier New', monospace",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      letterSpacing: ".06em",
                    }}
                  />
                )}
              </div>

              {scheduleErr && (
                <p style={{ color: t.red, fontSize: 13 }}>⚠️ {scheduleErr}</p>
              )}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  style={{
                    flex: 1,
                    background: t.surface2,
                    border: `1px solid ${t.border2}`,
                    color: t.subtle,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "13px 0",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={scheduling}
                  style={{
                    flex: 2,
                    background: t.text,
                    color: t.surface,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "13px 0",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    opacity: scheduling ? 0.7 : 1,
                  }}
                >
                  {scheduling ? "Saving…" : "Save Template"}
                </button>
              </div>
              <div
                style={{
                  background: t.accentBg,
                  border: `1px solid ${t.accentBorder}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <p
                  style={{
                    color: t.accent,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  ℹ️ Templates must be approved by WhatsApp Business API before
                  they can be sent. After saving, submit your template in the
                  Meta Business Manager for approval.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── AUDIENCES TAB ────────────────────────────────────────────────────────────
function AudiencesTab({ t, restId }) {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [memberCounts, setMemberCounts] = useState({}); // tag_id → count
  const [specialCounts, setSpecialCounts] = useState({});
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_PALETTE[0]);
  const [tagSaving, setTagSaving] = useState(false);
  const [tagFormErr, setTagFormErr] = useState("");
  const [delConfirm, setDelConfirm] = useState(null);
  const [showAddMembers, setShowAddMembers] = useState(null); // tag or special audience
  const [addMembersData, setAddMembersData] = useState([]);
  const [addMembersLoading, setAddMembersLoading] = useState(false);
  const [addMembersSearch, setAddMembersSearch] = useState("");
  const [tagMemberSet, setTagMemberSet] = useState(new Set());
  const [specialModal, setSpecialModal] = useState(null); // { audience, members, loading }
  const [specialModalSearch, setSpecialModalSearch] = useState("");

  const load = useCallback(async () => {
    if (!restId) return;
    setTagsLoading(true);
    try {
      const { data: tData } = await supabase
        .from("Tags")
        .select("id,name,color,created_at")
        .eq("rest_id", restId)
        .order("created_at");
      const tags = tData || [];
      setTags(tags);

      // Count members per tag
      if (tags.length > 0) {
        const counts = {};
        await Promise.all(
          tags.map(async (tg) => {
            const { count } = await supabase
              .from("Customer_Tags")
              .select("id", { count: "exact", head: true })
              .eq("tag_id", tg.id);
            counts[tg.id] = count || 0;
          }),
        );
        setMemberCounts(counts);
      }

      // Compute special audience counts
      await computeSpecialCounts();
    } catch (e) {
      console.error(e);
    } finally {
      setTagsLoading(false);
    }
  }, [restId]);

  // Shared data-fetching helper used by BOTH computeSpecialCounts and openSpecialAudienceDetails
  // so the count card and the modal always use identical logic.
  const buildAudienceData = async () => {
    const now = new Date();
    const d30ms = now.getTime() - 30 * 86400000;
    const d90ms = now.getTime() - 90 * 86400000;
    const d7ms = now.getTime() - 7 * 86400000;
    const d30dateStr = new Date(d30ms).toISOString().slice(0, 10);

    // 1. All accepted orders for this restaurant
    const { data: orders, error: oErr } = await supabase
      .from("Orders")
      .select("cust_id, total_amount, created_at")
      .eq("rest_id", restId)
      .in("status", ["delivered", "accepted", "preparing", "on_the_way"]);
    if (oErr) throw oErr;
    const allOrders = orders || [];

    // 2. Build per-customer stats; use string IDs throughout to avoid type mismatches
    const custMap = {}; // string → { orders, rev, lastOrderMs }
    allOrders.forEach((o) => {
      const id = String(o.cust_id);
      if (!custMap[id]) custMap[id] = { orders: 0, rev: 0, lastOrderMs: 0 };
      custMap[id].orders++;
      custMap[id].rev += Number(o.total_amount || 0);
      const ms = new Date(o.created_at).getTime();
      if (ms > custMap[id].lastOrderMs) custMap[id].lastOrderMs = ms;
    });
    const custIds = Object.keys(custMap); // string IDs of everyone who ever ordered

    // 3. All customers linked to this restaurant (for new/opencart/potential)
    const { data: linkedRows, error: lErr } = await supabase
      .from("Customer_Restaurant")
      .select("cust_id")
      .eq("rest_id", restId);
    if (lErr) throw lErr;
    const linkedSetStr = new Set(
      (linkedRows || []).map((r) => String(r.cust_id)),
    );

    // 4. New customers — joined_on in last 30 days AND linked to restaurant
    const { data: newRows, error: nErr } = await supabase
      .from("Customer")
      .select("id,cust_name,ph_num,joined_on")
      .gte("joined_on", d30dateStr);
    if (nErr) throw nErr;
    const newMembers = (newRows || []).filter((c) =>
      linkedSetStr.has(String(c.id)),
    );

    // 5. Active — ordered within last 30 days (timestamp comparison, not Date object)
    const active = custIds.filter((id) => custMap[id].lastOrderMs >= d30ms);

    // 6. Inactive — last order was 90+ days ago
    const inactive = custIds.filter((id) => custMap[id].lastOrderMs < d90ms);

    // 7. VIP — top 20% by total lifetime spend (min 1)
    const sortedByRev = [...custIds].sort(
      (a, b) => custMap[b].rev - custMap[a].rev,
    );
    const vipCutoff = Math.max(1, Math.ceil(sortedByRev.length * 0.2));
    const vip = sortedByRev.slice(0, vipCutoff);

    // 8. Repeat Buyers — 5+ orders
    const repeatbuyers = custIds.filter((id) => custMap[id].orders >= 5);

    // 9. High Avg Spend — per-order avg > 2× restaurant-wide per-order avg
    const totalOrders = allOrders.length;
    const totalRevSum = Object.values(custMap).reduce((s, c) => s + c.rev, 0);
    const restaurantAvgOrderValue =
      totalOrders > 0 ? totalRevSum / totalOrders : 0;
    const highavg = custIds.filter((id) => {
      const c = custMap[id];
      return c.orders > 0 && c.rev / c.orders >= restaurantAvgOrderValue * 2;
    });

    // 10. Open Cart — linked to restaurant, but no accepted order in last 7 days
    //     (same source as potential; just a recency filter)
    const recentOrdererSet = new Set(
      allOrders
        .filter((o) => new Date(o.created_at).getTime() >= d7ms)
        .map((o) => String(o.cust_id)),
    );
    const openCart = [...linkedSetStr].filter(
      (id) => !recentOrdererSet.has(id),
    );

    // 11. Potential — linked but never placed any accepted order ever
    const orderedSetStr = new Set(custIds);
    const potential = [...linkedSetStr].filter((id) => !orderedSetStr.has(id));

    return {
      custMap,
      custIds,
      allOrders,
      linkedSetStr,
      active,
      inactive,
      vip,
      repeatbuyers,
      highavg,
      openCart,
      potential,
      newMembers,
      d30ms,
      d90ms,
      d7ms,
    };
  };

  const computeSpecialCounts = async () => {
    if (!restId) return;
    try {
      const d = await buildAudienceData();
      setSpecialCounts({
        active: d.active.length,
        vip: d.vip.length,
        new: d.newMembers.length,
        inactive: d.inactive.length,
        opencart: d.openCart.length,
        potential: d.potential.length,
        highavg: d.highavg.length,
        repeatbuyers: d.repeatbuyers.length,
      });
    } catch (e) {
      console.error("[specialCounts]", e);
    }
  };

  // ── Open details modal for a special (smart) audience ──────────────────────
  const openSpecialAudienceDetails = async (audience) => {
    setSpecialModal({ audience, members: [], loading: true });
    setSpecialModalSearch("");
    try {
      const d = await buildAudienceData();

      let targetIds = [];
      let prebuiltMembers = null; // used for audiences that already have full profile data

      switch (audience.id) {
        case "active":
          targetIds = d.active;
          break;
        case "inactive":
          targetIds = d.inactive;
          break;
        case "vip":
          targetIds = d.vip;
          break;
        case "repeatbuyers":
          targetIds = d.repeatbuyers;
          break;
        case "highavg":
          targetIds = d.highavg;
          break;
        case "opencart":
          targetIds = d.openCart;
          break;
        case "potential":
          targetIds = d.potential;
          break;
        case "new":
          // newMembers already has full profile rows from buildAudienceData
          prebuiltMembers = d.newMembers
            .map((p) => ({
              id: p.id,
              name: p.cust_name || "—",
              phone: p.ph_num || "—",
              orders: d.custMap[String(p.id)]?.orders ?? 0,
              rev: d.custMap[String(p.id)]?.rev ?? 0,
              joined: p.joined_on,
            }))
            .sort((a, b) => b.rev - a.rev);
          break;
        default:
          targetIds = [];
      }

      if (prebuiltMembers) {
        setSpecialModal({ audience, members: prebuiltMembers, loading: false });
        return;
      }

      if (targetIds.length === 0) {
        setSpecialModal({ audience, members: [], loading: false });
        return;
      }

      // Batch fetch in chunks of 500 to avoid Supabase URL-length limits
      const CHUNK = 500;
      let profiles = [];
      for (let i = 0; i < targetIds.length; i += CHUNK) {
        const chunk = targetIds.slice(i, i + CHUNK);
        const { data: rows, error } = await supabase
          .from("Customer")
          .select("id,cust_name,ph_num,joined_on")
          .in("id", chunk);
        if (error) throw error;
        profiles = profiles.concat(rows || []);
      }

      const members = profiles
        .map((p) => ({
          id: p.id,
          name: p.cust_name || "—",
          phone: p.ph_num || "—",
          orders: d.custMap[String(p.id)]?.orders ?? 0,
          rev: d.custMap[String(p.id)]?.rev ?? 0,
          joined: p.joined_on,
        }))
        .sort((a, b) => b.rev - a.rev);

      setSpecialModal({ audience, members, loading: false });
    } catch (e) {
      console.error("[specialModal]", e);
      setSpecialModal((prev) =>
        prev ? { ...prev, loading: false, error: e.message } : null,
      );
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const createTag = async () => {
    const name = newTagName.trim();
    if (!name) {
      setTagFormErr("Tag name is required.");
      return;
    }
    if (name.length > 30) {
      setTagFormErr("Max 30 characters.");
      return;
    }
    if (tags.some((tg) => tg.name.toLowerCase() === name.toLowerCase())) {
      setTagFormErr("Tag already exists.");
      return;
    }
    setTagSaving(true);
    setTagFormErr("");
    try {
      const { data, error } = await supabase
        .from("Tags")
        .insert({ rest_id: restId, name, color: newTagColor })
        .select()
        .single();
      if (error) throw error;
      setTags((p) => [...p, data]);
      setMemberCounts((p) => ({ ...p, [data.id]: 0 }));
      setNewTagName("");
      setNewTagColor(TAG_PALETTE[0]);
      setShowCreate(false);
    } catch (e) {
      setTagFormErr(
        e.message?.includes("unique")
          ? "Tag already exists."
          : e.message || "Failed to create.",
      );
    } finally {
      setTagSaving(false);
    }
  };

  const deleteTag = async (tagId) => {
    await supabase.from("Tags").delete().eq("id", tagId);
    setTags((p) => p.filter((tg) => tg.id !== tagId));
    setDelConfirm(null);
  };

  const openAddMembers = async (tag) => {
    setShowAddMembers(tag);
    setAddMembersLoading(true);
    setAddMembersSearch("");
    setAddMembersData([]);
    try {
      // Load existing members
      const { data: existing } = await supabase
        .from("Customer_Tags")
        .select("cust_id")
        .eq("tag_id", tag.id);
      setTagMemberSet(new Set((existing || []).map((r) => r.cust_id)));
      // Load all restaurant customers
      const { data: orders } = await supabase
        .from("Orders")
        .select("cust_id")
        .eq("rest_id", restId);
      const custIds = [...new Set((orders || []).map((o) => o.cust_id))];
      if (!custIds.length) {
        setAddMembersData([]);
        setAddMembersLoading(false);
        return;
      }
      const { data: custs } = await supabase
        .from("Customer")
        .select("id,cust_name,ph_num")
        .in("id", custIds)
        .order("cust_name");
      setAddMembersData(custs || []);
    } catch {
      setAddMembersData([]);
    } finally {
      setAddMembersLoading(false);
    }
  };

  const addToTag = async (cust) => {
    if (!showAddMembers || tagMemberSet.has(cust.id)) return;
    const { error } = await supabase
      .from("Customer_Tags")
      .insert({ tag_id: showAddMembers.id, cust_id: cust.id, rest_id: restId });
    if (!error) {
      setTagMemberSet((p) => new Set([...p, cust.id]));
      setMemberCounts((p) => ({
        ...p,
        [showAddMembers.id]: (p[showAddMembers.id] || 0) + 1,
      }));
    }
  };

  const filteredTags = tags.filter(
    (tg) => !search || tg.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredSpecial = SPECIAL_AUDIENCES.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const AudienceCard = ({
    name,
    count,
    color,
    icon,
    onDelete,
    onViewDetails,
  }) => (
    <div
      style={{
        background: t.surface,
        border: `2px solid ${t.border}`,
        borderTop: `3px solid ${color || t.accent}`,
        borderRadius: 12,
        padding: "16px 16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: t.muted,
            fontSize: 16,
          }}
          title="Delete audience"
        >
          🗑
        </button>
      )}
      <p
        style={{
          fontFamily: "'Lato', sans-serif",
          color: t.text,
          fontWeight: 700,
          fontSize: 14,
          paddingRight: 24,
        }}
      >
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {name}
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: t.text,
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1,
          margin: "4px 0",
        }}
      >
        {count ?? "—"}
      </p>
      <p
        style={{
          color: t.muted,
          fontFamily: "'Lato', sans-serif",
          fontSize: 12,
        }}
      >
        Total members
      </p>
      <button
        onClick={onViewDetails}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: t.accent,
          fontFamily: "'Lato', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          padding: 0,
          marginTop: 4,
        }}
      >
        👁 View Audience Details ›
      </button>
    </div>
  );

  return (
    <div style={{ padding: "20px 24px 40px" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
              fontSize: 14,
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audience…"
            style={{
              width: "100%",
              paddingLeft: 36,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
              borderRadius: 99,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: t.text,
            color: t.surface,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          + Create Audience
        </button>
        <button
          onClick={() => setShowAddMembers({ id: null, name: "All Audiences" })}
          style={{
            background: t.surface,
            border: `1px solid ${t.border2}`,
            color: t.text,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Add Audience Members
        </button>
      </div>

      {/* Create tag modal */}
      {showCreate && (
        <>
          <div
            onClick={() => setShowCreate(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 201,
              background: t.surface,
              borderRadius: 16,
              padding: 28,
              width: "min(420px, calc(100vw - 32px))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: t.text,
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              Create Audience
            </p>
            <label
              style={{
                color: t.subtle,
                fontFamily: "'Lato', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Audience Name
            </label>
            <input
              value={newTagName}
              onChange={(e) => {
                setNewTagName(e.target.value);
                setTagFormErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
              placeholder="e.g. Female, VIP, Weekend Diners…"
              maxLength={30}
              style={{
                width: "100%",
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                color: t.text,
                fontFamily: "'Lato', sans-serif",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 14,
                boxSizing: "border-box",
              }}
            />
            <label
              style={{
                color: t.subtle,
                fontFamily: "'Lato', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Colour
            </label>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {TAG_PALETTE.map((col) => (
                <button
                  key={col}
                  onClick={() => setNewTagColor(col)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: col,
                    border:
                      newTagColor === col
                        ? `3px solid ${t.text}`
                        : "3px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            {tagFormErr && (
              <p style={{ color: t.red, fontSize: 12, marginBottom: 10 }}>
                ⚠️ {tagFormErr}
              </p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1,
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  color: t.subtle,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "11px 0",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createTag}
                disabled={tagSaving}
                style={{
                  flex: 2,
                  background: t.text,
                  color: t.surface,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "11px 0",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  opacity: tagSaving ? 0.7 : 1,
                }}
              >
                {tagSaving ? "Creating…" : "Create Audience"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Special audiences */}
      {!search && (
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              color: t.subtle,
              fontFamily: "'Lato', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Smart Audiences
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {SPECIAL_AUDIENCES.map((s) => (
              <AudienceCard
                key={s.id}
                name={s.name}
                count={specialCounts[s.id]}
                color={s.color}
                icon={s.icon}
                onViewDetails={() => openSpecialAudienceDetails(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom tag audiences */}
      <div>
        <p
          style={{
            color: t.subtle,
            fontFamily: "'Lato', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          {search ? "Search Results" : "Custom Audiences"}
        </p>
        {tagsLoading ? (
          <p style={{ color: t.muted, fontSize: 13 }}>Loading…</p>
        ) : filteredTags.length === 0 && !search ? (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "28px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: t.muted, fontSize: 14 }}>
              No custom audiences yet. Create one above.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {filteredTags.map((tag) => (
              <div key={tag.id}>
                <AudienceCard
                  name={tag.name}
                  count={memberCounts[tag.id] ?? "…"}
                  color={tag.color}
                  icon="🏷️"
                  onDelete={() => setDelConfirm(tag.id)}
                  onViewDetails={() => openAddMembers(tag)}
                />
                {delConfirm === tag.id && (
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginTop: 6,
                    }}
                  >
                    <p
                      style={{
                        color: "#B83232",
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      Delete "{tag.name}"? All member links removed.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setDelConfirm(null)}
                        style={{
                          flex: 1,
                          background: "none",
                          border: `1px solid ${t.border2}`,
                          color: t.subtle,
                          borderRadius: 6,
                          padding: "5px 0",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        style={{
                          flex: 1,
                          background: "#B83232",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 0",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {search &&
              filteredSpecial.map((s) => (
                <AudienceCard
                  key={s.id}
                  name={s.name}
                  count={specialCounts[s.id]}
                  color={s.color}
                  icon={s.icon}
                  onViewDetails={() => openSpecialAudienceDetails(s)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add members panel */}
      {showAddMembers && showAddMembers.id && (
        <>
          <div
            onClick={() => setShowAddMembers(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 201,
              background: t.surface,
              borderRadius: 16,
              padding: 24,
              width: "min(480px, calc(100vw - 32px))",
              maxHeight: "70vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: t.text,
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {showAddMembers.name}
              </p>
              <button
                onClick={() => setShowAddMembers(null)}
                style={{
                  background: t.surface2,
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  color: t.subtle,
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>
            <input
              value={addMembersSearch}
              onChange={(e) => setAddMembersSearch(e.target.value)}
              placeholder="Search customers…"
              style={{
                width: "100%",
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                color: t.text,
                fontFamily: "'Lato', sans-serif",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            <div style={{ flex: 1, overflowY: "auto" }}>
              {addMembersLoading ? (
                <p style={{ color: t.muted, fontSize: 13 }}>Loading…</p>
              ) : (
                addMembersData
                  .filter(
                    (c) =>
                      !addMembersSearch ||
                      (c.cust_name || "")
                        .toLowerCase()
                        .includes(addMembersSearch.toLowerCase()) ||
                      (c.ph_num || "").includes(addMembersSearch),
                  )
                  .map((cust) => {
                    const inTag = tagMemberSet.has(cust.id);
                    return (
                      <div
                        key={cust.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 0",
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              color: t.text,
                              fontSize: 13,
                              fontWeight: 600,
                              fontFamily: "'Lato', sans-serif",
                            }}
                          >
                            {cust.cust_name || "—"}
                          </p>
                          <p
                            style={{
                              color: t.muted,
                              fontSize: 11,
                              fontFamily: "'Lato', sans-serif",
                            }}
                          >
                            {cust.ph_num || ""}
                          </p>
                        </div>
                        <button
                          onClick={() => addToTag(cust)}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: 6,
                            border: "none",
                            cursor: inTag ? "default" : "pointer",
                            background: inTag ? t.greenBg : t.accentBg,
                            color: inTag ? t.green : t.accent,
                          }}
                        >
                          {inTag ? "✓ Added" : "+ Add"}
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Special Audience Details Modal ─────────────────────────────────── */}
      {specialModal && (
        <>
          <div
            onClick={() => setSpecialModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 201,
              background: t.surface,
              borderRadius: 18,
              width: "min(520px, calc(100vw - 24px))",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                background: specialModal.audience.color,
                padding: "20px 24px 16px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#fff",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 800,
                      margin: 0,
                    }}
                  >
                    {specialModal.audience.icon} {specialModal.audience.name}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {specialModal.audience.desc}
                  </p>
                </div>
                <button
                  onClick={() => setSpecialModal(null)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  marginTop: 12,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  display: "inline-block",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {specialModal.loading
                    ? "Loading…"
                    : `${specialModal.members?.length ?? 0} members`}
                </span>
              </div>
            </div>

            {/* Search */}
            <div
              style={{
                padding: "14px 20px 10px",
                flexShrink: 0,
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <input
                value={specialModalSearch}
                onChange={(e) => setSpecialModalSearch(e.target.value)}
                placeholder="Search by name or phone…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: t.surface2,
                  border: `1px solid ${t.border2}`,
                  color: t.text,
                  fontFamily: "'Lato', sans-serif",
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>

            {/* Member list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {specialModal.loading ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <p
                    style={{
                      color: t.muted,
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    Loading members…
                  </p>
                </div>
              ) : specialModal.error ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <p
                    style={{
                      color: t.red,
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    ⚠️ {specialModal.error}
                  </p>
                </div>
              ) : specialModal.members.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>
                    {specialModal.audience.icon}
                  </div>
                  <p
                    style={{
                      color: t.muted,
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    No members in this audience yet.
                  </p>
                </div>
              ) : (
                specialModal.members
                  .filter((m) => {
                    if (!specialModalSearch) return true;
                    const q = specialModalSearch.toLowerCase();
                    return (
                      (m.name || "").toLowerCase().includes(q) ||
                      (m.phone || "").includes(q)
                    );
                  })
                  .map((m, i) => (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 20px",
                        borderBottom: `1px solid ${t.border}`,
                        background:
                          i % 2 === 0 ? "transparent" : t.surface2 + "55",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: specialModal.audience.color + "22",
                          border: `1.5px solid ${specialModal.audience.color}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 800,
                          color: specialModal.audience.color,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {(m.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: t.text,
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: 13,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.name}
                        </p>
                        <p
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                            fontSize: 11,
                            margin: 0,
                            marginTop: 1,
                          }}
                        >
                          {m.phone || "—"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p
                          style={{
                            color: t.accent,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 800,
                            fontSize: 14,
                            margin: 0,
                          }}
                        >
                          KD {Number(m.rev || 0).toFixed(3)}
                        </p>
                        <p
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                            fontSize: 11,
                            margin: 0,
                            marginTop: 1,
                          }}
                        >
                          {m.orders} order{m.orders !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function AudienceMembersTab({ t, restId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!restId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("Customer_Tags")
        .select(
          "id, cust_id, added_at, rest_id, tag_id, Tags(name, color), Customer(cust_name, ph_num, broadcast)",
        )
        .eq("rest_id", restId)
        .order("added_at", { ascending: false });
      setMembers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.Customer?.cust_name || "").toLowerCase().includes(q) ||
      (m.Customer?.ph_num || "").includes(q) ||
      (m.Tags?.name || "").toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id) =>
    setSelectedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelectedIds(
      selectedIds.size === filtered.length
        ? new Set()
        : new Set(filtered.map((m) => m.id)),
    );

  const deleteSelected = async () => {
    if (!selectedIds.size) return;
    setDeleting(true);
    await supabase
      .from("Customer_Tags")
      .delete()
      .in("id", [...selectedIds]);
    setMembers((p) => p.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
    setDeleting(false);
  };

  return (
    <div style={{ padding: "20px 24px 40px" }}>
      <style>{`
        .am-table { width: 100%; border-collapse: collapse; min-width: 580px; }
        .am-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; }
        .am-table td { padding: 12px 14px; font-size: 13px; vertical-align: middle; border-bottom: 1px solid; white-space: nowrap; }
        .am-table tr:hover td { filter: brightness(0.97); }
        @media(max-width:600px){ .am-table th, .am-table td { padding: 9px 10px; font-size: 12px; } }
      `}</style>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 0 }}>
          <span
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
              fontSize: 14,
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table…"
            style={{
              width: "100%",
              paddingLeft: 34,
              paddingRight: 14,
              paddingTop: 9,
              paddingBottom: 9,
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
              borderRadius: 8,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            style={{
              background: t.text,
              color: t.surface,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Deleting…" : `Delete Selected (${selectedIds.size})`}
          </button>
        )}
        <button
          onClick={load}
          style={{
            background: t.surface2,
            border: `1px solid ${t.border2}`,
            color: t.subtle,
            fontFamily: "'Lato', sans-serif",
            fontSize: 13,
            padding: "9px 14px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: t.muted, fontSize: 13 }}>Loading members…</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: 12,
            border: `1px solid ${t.border}`,
          }}
        >
          <table className="am-table">
            <thead>
              <tr style={{ background: t.text, color: t.surface }}>
                <th style={{ color: "#fff", width: 44 }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size > 0 &&
                      selectedIds.size === filtered.length
                    }
                    onChange={toggleAll}
                    style={{ accentColor: "#fff", width: 15, height: 15 }}
                  />
                </th>
                <th style={{ color: "#fff", fontFamily: "'Lato', sans-serif" }}>
                  Phone Number
                </th>
                <th style={{ color: "#fff", fontFamily: "'Lato', sans-serif" }}>
                  Member Name
                </th>
                <th
                  style={{
                    color: "#fff",
                    fontFamily: "'Lato', sans-serif",
                    textAlign: "center",
                  }}
                >
                  🔊
                </th>
                <th style={{ color: "#fff", fontFamily: "'Lato', sans-serif" }}>
                  Audiences
                </th>
                <th style={{ color: "#fff", fontFamily: "'Lato', sans-serif" }}>
                  Added
                </th>
                <th style={{ color: "#fff", width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      color: t.muted,
                      textAlign: "center",
                      padding: "32px 14px",
                      fontFamily: "'Lato', sans-serif",
                      borderBottom: "none",
                    }}
                  >
                    {search
                      ? "No members match your search."
                      : "No audience members yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{
                      background: i % 2 === 0 ? t.surface : t.surface2,
                      cursor: "default",
                    }}
                  >
                    <td style={{ color: t.text, borderBottomColor: t.border }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        style={{ accentColor: t.accent, width: 15, height: 15 }}
                      />
                    </td>
                    <td
                      style={{
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                        borderBottomColor: t.border,
                        fontWeight: 600,
                      }}
                    >
                      {m.Customer?.ph_num || "—"}
                    </td>
                    <td
                      style={{
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                        borderBottomColor: t.border,
                      }}
                    >
                      {m.Customer?.cust_name || "—"}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        borderBottomColor: t.border,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 12,
                          color: m.Customer?.broadcast ? t.green : t.muted,
                        }}
                      >
                        {m.Customer?.broadcast ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ borderBottomColor: t.border }}>
                      {m.Tags ? (
                        <span
                          style={{
                            display: "inline-block",
                            background: (m.Tags.color || t.accent) + "22",
                            border: `1px solid ${m.Tags.color || t.accent}44`,
                            color: m.Tags.color || t.accent,
                            fontFamily: "'Lato', sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 99,
                          }}
                        >
                          {m.Tags.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      style={{
                        color: t.muted,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 12,
                        borderBottomColor: t.border,
                      }}
                    >
                      {new Date(m.added_at).toLocaleDateString("en-KW", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ borderBottomColor: t.border }}>
                      <button
                        onClick={async () => {
                          await supabase
                            .from("Customer_Tags")
                            .delete()
                            .eq("id", m.id);
                          setMembers((p) => p.filter((x) => x.id !== m.id));
                        }}
                        style={{
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          color: "#B83232",
                          borderRadius: 6,
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                        title="Remove from audience"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                background: t.surface2,
                borderTop: `1px solid ${t.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  color: t.muted,
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 12,
                }}
              >
                {filtered.length} member{filtered.length !== 1 ? "s" : ""}
              </p>
              {selectedIds.size > 0 && (
                <p
                  style={{
                    color: t.accent,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {selectedIds.size} selected
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
// ─── Orders helpers ───────────────────────────────────────────────────────────
const fmtKD = (n) => `KD ${Number(n || 0).toFixed(3)}`;
const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-KW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const STATUS_META = {
  pending: { label: "New", color: "#C4711A", bg: "rgba(196,113,26,0.1)" },
  accepted: { label: "Accepted", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  preparing: {
    label: "Preparing",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
  },
  on_the_way: {
    label: "Out for Delivery",
    color: "#2D7A4F",
    bg: "rgba(45,122,79,0.08)",
  },
  delivered: {
    label: "Delivered",
    color: "#2D7A4F",
    bg: "rgba(45,122,79,0.08)",
  },
  rejected: { label: "Rejected", color: "#B83232", bg: "rgba(184,50,50,0.08)" },
  cancelled: { label: "Cancelled", color: "#B83232", bg: "rgba(184,50,50,0.08)" },
};

// ─── Invoice Generator (opens print dialog with styled HTML) ─────────────────
function printInvoice(order, items, restaurant, discount, deliveryAddr) {
  // ── computed values ─────────────────────────────────────────────────────────
  const safeItems = items || [];
  const itemsSubtotal = safeItems.reduce(
    (s, it) => s + Number(it.subtotal ?? it.unit_price * it.quantity ?? 0),
    0,
  );
  const deliveryFee = 0.5;
  const discountAmt = discount?.amount_saved ?? 0;
  const grandTotal = Number(
    order.total_amount ?? itemsSubtotal + deliveryFee - discountAmt,
  );

  // ── item rows ───────────────────────────────────────────────────────────────
  const itemRows =
    safeItems
      .map(
        (it, idx) => `
    <tr class="${idx % 2 === 0 ? "row-even" : "row-odd"}">
      <td class="td-qty">${it.quantity}×</td>
      <td class="td-name">
        <span class="item-name">${it.menu_name || it.menu_id || "Item"}</span>
        ${(it.variants || []).map((v) => `<span class="item-variant">· ${v}</span>`).join("")}
        ${it.item_note ? `<span class="item-note">📝 ${it.item_note}</span>` : ""}
      </td>
      <td class="td-price">KD ${Number(it.unit_price).toFixed(3)}</td>
      <td class="td-sub">KD ${Number(it.subtotal ?? it.unit_price * it.quantity ?? 0).toFixed(3)}</td>
    </tr>`,
      )
      .join("") ||
    `<tr><td colspan="4" style="padding:16px;text-align:center;color:#aaa;font-style:italic">No items recorded</td></tr>`;

  // ── address line ────────────────────────────────────────────────────────────
  const addrLine = deliveryAddr
    ? [
        deliveryAddr.apartment_no && `Apt ${deliveryAddr.apartment_no}`,
        deliveryAddr.floor && `Floor ${deliveryAddr.floor}`,
        deliveryAddr.bldg_name,
        deliveryAddr.street,
        deliveryAddr.block,
        deliveryAddr.landmark,
      ]
        .filter(Boolean)
        .join(", ")
    : order.deliveryAddress || "";

  // ── status pill colours ─────────────────────────────────────────────────────
  const statusColours = {
    pending: { bg: "#fff7ed", color: "#c4711a", border: "#fed7aa" },
    accepted: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    preparing: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    on_the_way: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    delivered: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    rejected: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  };
  const sc = statusColours[order.status] || statusColours.pending;
  const statusLabel = STATUS_META[order.status]?.label || order.status || "—";

  // ── discount row ────────────────────────────────────────────────────────────
  const discountRow =
    discount && discountAmt > 0
      ? `
    <div class="tally-row discount-row">
      <span class="tally-label">
        <span class="disc-pill">🏷 ${discount.code}</span>
        <span class="disc-type">${discount.type === "percentage" ? `${discount.value}% off` : `KD ${Number(discount.value).toFixed(3)} off`}</span>
      </span>
      <span class="tally-value discount-value">−KD ${discountAmt.toFixed(3)}</span>
    </div>`
      : "";

  // ── print timestamp ─────────────────────────────────────────────────────────
  const now = new Date().toLocaleString("en-KW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Invoice #${order.id} — ${restaurant?.name || "Restaurant"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter','Segoe UI',Arial,sans-serif;background:#f5f5f5;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{max-width:720px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12)}
    /* Hero */
    .hero{background:linear-gradient(135deg,#1a1208 0%,#2d1f0a 50%,#3d2a0e 100%);padding:36px 40px 32px;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;background:radial-gradient(circle,rgba(196,113,26,.25) 0%,transparent 70%);border-radius:50%}
    .hero::after{content:'';position:absolute;bottom:-40px;left:30%;width:160px;height:160px;background:radial-gradient(circle,rgba(196,113,26,.12) 0%,transparent 70%);border-radius:50%}
    .hero-inner{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start}
    .brand-name{font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:800;color:#fff;letter-spacing:-.5px;line-height:1}
    .brand-sub{font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.18em;text-transform:uppercase;margin-top:5px}
    .invoice-label{text-align:right}
    .invoice-word{font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.45)}
    .invoice-num{font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:800;color:#C4711A;line-height:1.1}
    .status-pill{display:inline-block;margin-top:7px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;background:${sc.bg};color:${sc.color};border:1px solid ${sc.border}}
    /* Accent stripe */
    .accent-stripe{height:4px;background:linear-gradient(90deg,#C4711A 0%,#e8911a 50%,#f5c068 100%)}
    /* Body */
    .body{padding:36px 40px}
    /* Meta grid */
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #f0ece6;border-radius:14px;overflow:hidden;margin-bottom:28px}
    .meta-cell{padding:16px 20px;border-right:1px solid #f0ece6;border-bottom:1px solid #f0ece6}
    .meta-cell:nth-child(2n){border-right:none}
    .meta-cell:nth-last-child(-n+2){border-bottom:none}
    .meta-cell.full{grid-column:1/-1;border-right:none}
    .meta-cell.full:last-child{border-bottom:none}
    .cell-label{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b0a898;margin-bottom:4px}
    .cell-value{font-size:13.5px;font-weight:600;color:#1a1a1a;line-height:1.3}
    .cell-sub{font-size:12px;color:#888;margin-top:2px}
    /* Section heading */
    .section-heading{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .sh-text{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C4711A}
    .sh-line{flex:1;height:1px;background:#f0ece6}
    /* Items table */
    .items-table{width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;margin-bottom:24px}
    .items-table thead tr{background:#f9f6f2}
    .items-table thead th{padding:11px 14px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b0a898;border-bottom:2px solid #f0ece6;text-align:left}
    .items-table thead th:nth-child(3),.items-table thead th:nth-child(4){text-align:right}
    .td-qty{padding:13px 14px;font-size:13px;color:#C4711A;font-weight:700;vertical-align:top;white-space:nowrap}
    .td-name{padding:13px 14px;vertical-align:top}
    .td-price{padding:13px 14px;text-align:right;font-size:13px;color:#666;vertical-align:top;white-space:nowrap}
    .td-sub{padding:13px 14px;text-align:right;font-size:13px;font-weight:700;color:#1a1a1a;vertical-align:top;white-space:nowrap}
    .row-even{background:#fff}
    .row-odd{background:#fdfcfb}
    .items-table tbody tr:last-child td{border-bottom:1px solid #f0ece6}
    .item-name{display:block;font-size:13.5px;font-weight:600;color:#1a1a1a}
    .item-variant{display:block;font-size:11px;color:#C4711A;margin-top:2px}
    .item-note{display:block;font-size:11px;color:#aaa;font-style:italic;margin-top:2px}
    /* Tally */
    .tally-box{background:#f9f6f2;border:1px solid #f0ece6;border-radius:14px;overflow:hidden;margin-bottom:28px}
    .tally-inner{padding:6px 20px 4px}
    .tally-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #ede9e2;font-size:13.5px}
    .tally-row:last-child{border-bottom:none}
    .tally-label{color:#666;font-weight:500;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .tally-value{color:#1a1a1a;font-weight:600}
    .discount-row .tally-label{color:#15803d}
    .discount-value{color:#15803d!important;font-weight:700!important}
    .disc-pill{display:inline-block;background:#dcfce7;border:1px solid #bbf7d0;color:#15803d;border-radius:999px;padding:2px 9px;font-size:10px;font-weight:800;letter-spacing:.06em}
    .disc-type{font-size:11px;color:#888}
    .tally-grand{background:linear-gradient(135deg,#1a1208,#2d1f0a);padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
    .tally-grand-label{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)}
    .tally-grand-value{font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:800;color:#C4711A}
    /* Info card */
    .info-card{border:1px solid #f0ece6;border-radius:14px;padding:16px 20px;margin-bottom:16px}
    .info-card-label{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b0a898;margin-bottom:8px}
    .info-card-value{font-size:13.5px;font-weight:600;color:#1a1a1a}
    .info-card-sub{font-size:12px;color:#888;margin-top:3px}
    /* Notes */
    .notes-box{background:#fffbf5;border:1px solid #fed7aa;border-left:3px solid #C4711A;border-radius:0 10px 10px 0;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#666;font-style:italic}
    /* Footer */
    .footer{background:#f9f6f2;border-top:1px solid #f0ece6;padding:24px 40px;text-align:center}
    .footer-thank{font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#C4711A;margin-bottom:6px}
    .footer-line{width:40px;height:2px;background:#C4711A;border-radius:2px;margin:10px auto}
    .footer-sub{font-size:11px;color:#bbb;letter-spacing:.06em}
    .print-meta{font-size:10px;color:#ccc;margin-top:10px}
    @media print{body{background:#fff}.page{margin:0;border-radius:0;box-shadow:none}@page{margin:0;size:A4}}
  </style>
</head>
<body>
<div class="page">
  <div class="hero">
    <div class="hero-inner">
      <div>
        <div class="brand-name">${restaurant?.name || "Ungrie"}</div>
        <div class="brand-sub">${restaurant?.branch_name || "Restaurant"}</div>
      </div>
      <div class="invoice-label">
        <div class="invoice-word">Invoice</div>
        <div class="invoice-num">#${order.id}</div>
        <div><span class="status-pill">${statusLabel}</span></div>
      </div>
    </div>
  </div>
  <div class="accent-stripe"></div>
  <div class="body">
    <div class="meta-grid">
      <div class="meta-cell">
        <div class="cell-label">Customer</div>
        <div class="cell-value">${order.cust_name || "—"}</div>
        ${order.cust_phone ? `<div class="cell-sub">${order.cust_phone}</div>` : ""}
      </div>
      <div class="meta-cell">
        <div class="cell-label">Order date</div>
        <div class="cell-value">${fmtDate(order.created_at)}</div>
      </div>
      <div class="meta-cell">
        <div class="cell-label">Payment method</div>
        <div class="cell-value">${order.payment_method || "—"}</div>
      </div>
      <div class="meta-cell">
        <div class="cell-label">Payment status</div>
        <div class="cell-value" style="text-transform:capitalize">${order.payment_status || "Pending"}</div>
      </div>
      ${
        order.delivery_rider_name
          ? `
      <div class="meta-cell">
        <div class="cell-label">Delivery rider</div>
        <div class="cell-value">${order.delivery_rider_name}</div>
        ${order.delivery_rider_phone ? `<div class="cell-sub">${order.delivery_rider_phone}</div>` : ""}
      </div>
      <div class="meta-cell"></div>`
          : ""
      }
    </div>
    ${
      order.notes
        ? `
    <div class="section-heading"><span class="sh-text">Order Notes</span><div class="sh-line"></div></div>
    <div class="notes-box">"${order.notes}"</div>`
        : ""
    }
    <div class="section-heading"><span class="sh-text">Order Items</span><div class="sh-line"></div></div>
    <table class="items-table">
      <thead><tr>
        <th style="width:52px">Qty</th>
        <th>Item</th>
        <th style="text-align:right;width:100px">Unit Price</th>
        <th style="text-align:right;width:110px">Subtotal</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="section-heading"><span class="sh-text">Bill Summary</span><div class="sh-line"></div></div>
    <div class="tally-box">
      <div class="tally-inner">
        <div class="tally-row">
          <span class="tally-label">Items subtotal</span>
          <span class="tally-value">KD ${itemsSubtotal.toFixed(3)}</span>
        </div>
        <div class="tally-row">
          <span class="tally-label">Delivery fee</span>
          <span class="tally-value">KD ${deliveryFee.toFixed(3)}</span>
        </div>
        ${discountRow}
      </div>
      <div class="tally-grand">
        <span class="tally-grand-label">Total</span>
        <span class="tally-grand-value">KD ${grandTotal.toFixed(3)}</span>
      </div>
    </div>
    ${
      addrLine
        ? `
    <div class="section-heading"><span class="sh-text">📍 Delivery Address</span><div class="sh-line"></div></div>
    <div class="info-card">
      <div class="info-card-label">${deliveryAddr?.label || "Delivery address"}</div>
      <div class="info-card-value">${addrLine}</div>
      ${deliveryAddr?.note ? `<div class="info-card-sub">Note: ${deliveryAddr.note}</div>` : ""}
    </div>`
        : ""
    }
  </div>
  <div class="footer">
    <div class="footer-thank">Thank you for your order!</div>
    <div class="footer-line"></div>
    <div class="footer-sub">${restaurant?.name || "Restaurant"} · Powered by Ungrie</div>
    <div class="print-meta">Printed ${now}</div>
  </div>
</div>
<script>window.onload=()=>window.print();</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

// ─── OrdersPage (full real-data implementation) ───────────────────────────────
function OrdersPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;

  // ── State ──────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);
  const [orderTab, setOrderTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [deliveryAddr, setDeliveryAddr] = useState(null); // fetched separately
  const [orderDiscount, setOrderDiscount] = useState(null);
  const [mobileView, setMobileView] = useState("list");

  // Action modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [riders, setRiders] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionErr, setActionErr] = useState("");

  // ── Fetch orders ───────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!restId) {
      setLoading(false);
      setLoadErr("No restaurant linked.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("Orders")
        .select(
          `id, status, total_amount, payment_method, payment_status, notes, created_at,
                 delivery_rider_name, delivery_rider_phone,
                 cust_id, Customer(id, cust_name, ph_num)`,
        )
        .eq("rest_id", restId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      setLoadErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [restId]);

  // ── Fetch delivery address for selected order's customer ───────────────────
  const fetchDeliveryAddr = useCallback(async (custId) => {
    setDeliveryAddr(null);
    if (!custId) return;
    try {
      // Get the default (first) address for this customer
      const { data } = await supabase
        .from("Customer_Address")
        .select(
          "id, label, street, block, bldg_name, apartment_no, floor, landmark, latitude, longitude, map_snapshot_url",
        )
        .eq("cust_id", custId)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      setDeliveryAddr(data || null);
    } catch (e) {
      console.error("[fetchDeliveryAddr]", e);
    }
  }, []);

  // ── Fetch riders ───────────────────────────────────────────────────────────
  const fetchRiders = useCallback(async () => {
    if (!restId) return;
    const { data } = await supabase
      .from("Delivery_Riders")
      .select("*")
      .eq("rest_id", restId)
      .eq("active", true)
      .order("name");
    setRiders(data || []);
  }, [restId]);

  // ── Fetch order items ──────────────────────────────────────────────────────
  const fetchOrderItems = useCallback(async (orderId) => {
    setItemsLoading(true);
    try {
      const { data: items, error } = await supabase
        .from("Order_Items")
        .select(
          `id, menu_id, quantity, unit_price, subtotal, item_note, Menu(name)`,
        )
        .eq("order_id", orderId);
      if (error) throw error;

      // Fetch variant option names for each item
      const enriched = await Promise.all(
        (items || []).map(async (it) => {
          const { data: vars } = await supabase
            .from("Order_Item_Variants")
            .select(`variant_opt_id, price_adj, "Variant Options"(name)`)
            .eq("order_item_id", it.id);
          return {
            ...it,
            menu_name: it.Menu?.name || "—",
            variants: (vars || [])
              .map((v) => v["Variant Options"]?.name)
              .filter(Boolean),
          };
        }),
      );
      setOrderItems(enriched);
    } catch (e) {
      console.error("[fetchOrderItems]", e);
      setOrderItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  // ── Fetch discount redemption for a specific order ─────────────────────────
  const fetchOrderDiscount = useCallback(async (orderId) => {
    setOrderDiscount(null);
    if (!orderId) return;
    try {
      const { data } = await supabase
        .from("Discount_Redemptions")
        .select("id, amount_saved, discount_id, Discounts(code, type, value)")
        .eq("order_id", orderId)
        .maybeSingle();
      if (data) {
        setOrderDiscount({
          code: data.Discounts?.code || "—",
          type: data.Discounts?.type || "fixed",
          value: data.Discounts?.value ?? 0,
          amount_saved: Number(data.amount_saved || 0),
        });
      }
    } catch (e) {
      // Table may not exist yet — fail silently
      console.warn("[fetchOrderDiscount]", e);
    }
  }, []);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!restId) return;
    fetchOrders();
    fetchRiders();

    const channel = supabase
      .channel(`orders-rest-${restId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Orders",
          filter: `rest_id=eq.${restId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch with simple Customer join (no nested address)
            const { data } = await supabase
              .from("Orders")
              .select(
                `id, status, total_amount, payment_method, payment_status, notes, created_at, delivery_rider_name, delivery_rider_phone, cust_id, Customer(id, cust_name, ph_num)`,
              )
              .eq("id", payload.new.id)
              .single();
            if (data) setOrders((prev) => [data, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === payload.new.id ? { ...o, ...payload.new } : o,
              ),
            );
            // If this is the selected order, update it too
            setSelectedOrder((prev) =>
              prev?.id === payload.new.id ? { ...prev, ...payload.new } : prev,
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restId, fetchOrders, fetchRiders]);

  // ── Select order ───────────────────────────────────────────────────────────
  const selectOrder = (order) => {
    setSelectedOrder(order);
    setMobileView("detail");
    fetchOrderItems(order.id);
    fetchDeliveryAddr(order.cust_id);
    fetchOrderDiscount(order.id);
    setActionErr("");
  };

  // ── Computed order lists ───────────────────────────────────────────────────
  const byStatus = {
    pending: orders.filter((o) => o.status === "pending"),
    accepted: orders.filter((o) => o.status === "accepted"),
    preparing: orders.filter((o) => o.status === "preparing"),
    on_the_way: orders.filter((o) => o.status === "on_the_way"),
    history: orders.filter((o) => ["delivered", "rejected"].includes(o.status)),
    cancelled: orders.filter((o) => o.status === "cancelled"),
  };
  const displayed = byStatus[orderTab] || [];

  // Count of active orders for header badge
  const activeCount =
    (byStatus.pending?.length || 0) +
    (byStatus.accepted?.length || 0) +
    (byStatus.preparing?.length || 0);

  // ── Status update helper ───────────────────────────────────────────────────
  const updateStatus = async (orderId, newStatus, extraFields = {}) => {
    setActionLoading(true);
    setActionErr("");
    try {
      const { error } = await supabase
        .from("Orders")
        .update({ status: newStatus, ...extraFields })
        .eq("id", orderId);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, ...extraFields } : o,
        ),
      );
      setSelectedOrder((prev) =>
        prev?.id === orderId
          ? { ...prev, status: newStatus, ...extraFields }
          : prev,
      );
    } catch (e) {
      setActionErr(e.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Accept order ───────────────────────────────────────────────────────────
  const handleAccept = () => updateStatus(selectedOrder.id, "accepted");

  // ── Mark preparing ─────────────────────────────────────────────────────────
  const handlePreparing = () => updateStatus(selectedOrder.id, "preparing");

  // ── Reject order ───────────────────────────────────────────────────────────
  // (handled inside RejectOrderModal)

  // ── Send for delivery ──────────────────────────────────────────────────────
  // (handled inside DeliveryAssignModal)

  // ── Mark delivered ─────────────────────────────────────────────────────────
  const handleDelivered = () => updateStatus(selectedOrder.id, "delivered");

  // ─── OrderCard ─────────────────────────────────────────────────────────────
  const OrderCard = ({ order }) => {
    const meta = STATUS_META[order.status] || STATUS_META.pending;
    const custName = order.Customer?.cust_name || "Customer";
    const isSelected = selectedOrder?.id === order.id;
    return (
      <button
        onClick={() => selectOrder(order)}
        style={{
          background: isSelected ? t.accentBg : t.surface,
          border: `1px solid ${isSelected ? t.accentBorder : t.border}`,
          textAlign: "left",
          width: "100%",
        }}
        className="rounded-xl p-3.5 transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
            className="text-xs"
          >
            #{order.id}
          </span>
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              fontFamily: "'Lato', sans-serif",
            }}
            className="text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {meta.label}
          </span>
        </div>
        <p
          style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
          className="text-sm font-semibold truncate"
        >
          {custName}
        </p>
        <div className="flex justify-between mt-1">
          <p
            style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
            className="text-xs"
          >
            {fmtDate(order.created_at)}
          </p>
          <p
            style={{ color: t.accent, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-bold"
          >
            {fmtKD(order.total_amount)}
          </p>
        </div>
        <p
          style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
          className="text-xs mt-0.5"
        >
          {order.payment_method}
        </p>
      </button>
    );
  };

  // ─── OrderDetail ───────────────────────────────────────────────────────────
  const OrderDetail = () => {
    if (!selectedOrder) return null;
    const meta = STATUS_META[selectedOrder.status] || STATUS_META.pending;
    const custName = selectedOrder.Customer?.cust_name || "Customer";
    const custPhone = selectedOrder.Customer?.ph_num || "—";
    const isPending = selectedOrder.status === "pending";
    const isAccepted = selectedOrder.status === "accepted";
    const isPreparing = selectedOrder.status === "preparing";
    const isOnWay = selectedOrder.status === "on_the_way";
    const isCancelled = selectedOrder.status === "cancelled";
    const isClosed = ["delivered", "rejected", "cancelled"].includes(selectedOrder.status);

    return (
      <div
        style={{ background: t.surface, border: `1px solid ${t.border}` }}
        className="flex-1 flex flex-col rounded-xl overflow-hidden min-w-0"
      >
        {/* Header */}
        <div
          style={{ borderBottom: `1px solid ${t.border}` }}
          className="px-5 pt-4 pb-3 flex items-center gap-3 flex-shrink-0"
        >
          <button
            onClick={() => setMobileView("list")}
            style={{
              color: t.accent,
              background: t.accentBg,
              border: `1px solid ${t.accentBorder}`,
            }}
            className="lg:hidden flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: t.text,
              }}
              className="text-xl font-bold"
            >
              Order #{selectedOrder.id}
            </h2>
            <p
              style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
              className="text-xs"
            >
              {fmtDate(selectedOrder.created_at)}
            </p>
          </div>
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              fontFamily: "'Lato', sans-serif",
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
          >
            {meta.label}
          </span>
          {/* Print invoice */}
          <button
            onClick={() =>
              printInvoice(
                {
                  ...selectedOrder,
                  cust_name: custName,
                  cust_phone: custPhone,
                },
                orderItems,
                null,
                orderDiscount,
                deliveryAddr,
              )
            }
            style={{
              color: t.subtle,
              background: t.surface2,
              border: `1px solid ${t.border2}`,
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:opacity-70 transition-opacity"
            title="Download invoice"
          >
            🧾
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Customer info */}
          <div
            style={{ borderBottom: `1px solid ${t.border}` }}
            className="px-5 py-4 flex items-center gap-3"
          >
            <div
              style={{
                background: t.accentBg,
                border: `1px solid ${t.accentBorder}`,
                color: t.accent,
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            >
              {custName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                className="text-sm font-semibold"
              >
                {custName}
              </p>
              <p
                style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                className="text-xs"
              >
                {custPhone}
              </p>
            </div>
            {custPhone !== "—" && (
              <a
                href={`https://wa.me/${custPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#25D366",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
                className="ml-auto flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:opacity-70 transition-opacity"
              >
                💬
              </a>
            )}
          </div>

          {/* Bill summary */}
          <div
            style={{ borderBottom: `1px solid ${t.border}` }}
            className="px-5 py-3"
          >
            {/* Payment row */}
            <div className="flex justify-between text-sm mb-2">
              <span
                style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
              >
                Payment
              </span>
              <span
                style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                className="font-semibold"
              >
                {selectedOrder.payment_method}
              </span>
            </div>

            {/* Breakdown rows */}
            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 8 }}>
              {/* Items subtotal — computed from loaded items */}
              {!itemsLoading &&
                orderItems.length > 0 &&
                (() => {
                  const itemsSubtotal = orderItems.reduce(
                    (s, it) =>
                      s +
                      Number(it.subtotal ?? it.unit_price * it.quantity ?? 0),
                    0,
                  );
                  return (
                    <div className="flex justify-between text-sm mb-1.5">
                      <span
                        style={{
                          color: t.subtle,
                          fontFamily: "'Lato', sans-serif",
                        }}
                      >
                        Items subtotal
                      </span>
                      <span
                        style={{
                          color: t.text,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="font-medium"
                      >
                        {fmtKD(itemsSubtotal)}
                      </span>
                    </div>
                  );
                })()}

              {/* Delivery fee */}
              <div className="flex justify-between text-sm mb-1.5">
                <span
                  style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                >
                  Delivery fee
                </span>
                <span
                  style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                  className="font-medium"
                >
                  KD 0.500
                </span>
              </div>

              {/* Discount — only shown when a redemption exists */}
              {orderDiscount && orderDiscount.amount_saved > 0 && (
                <div
                  className="flex justify-between text-sm mb-1.5"
                  style={{ alignItems: "center" }}
                >
                  <span
                    style={{
                      color: t.green,
                      fontFamily: "'Lato', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    🏷️
                    <span
                      style={{
                        background: t.greenBg,
                        border: `1px solid ${t.greenBorder}`,
                        color: t.green,
                        borderRadius: 999,
                        padding: "1px 8px",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".04em",
                      }}
                    >
                      {orderDiscount.code}
                    </span>
                    <span style={{ color: t.muted, fontSize: 11 }}>
                      (
                      {orderDiscount.type === "percentage"
                        ? `${orderDiscount.value}% off`
                        : `KD ${Number(orderDiscount.value).toFixed(3)} off`}
                      )
                    </span>
                  </span>
                  <span
                    style={{
                      color: t.green,
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    −{fmtKD(orderDiscount.amount_saved)}
                  </span>
                </div>
              )}

              {/* Grand total */}
              <div
                className="flex justify-between text-sm pt-2"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <span
                  style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                  className="font-bold"
                >
                  Total
                </span>
                <span
                  style={{ color: t.accent, fontFamily: "'Lato', sans-serif" }}
                  className="font-bold"
                >
                  {fmtKD(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div style={{ borderBottom: `1px solid ${t.border}` }}>
            <div className="grid grid-cols-12 px-5 py-2">
              {[
                ["Qty", "col-span-2"],
                ["Items", "col-span-7"],
                ["KD", "col-span-3 text-right"],
              ].map(([l, c]) => (
                <span
                  key={l}
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className={`${c} text-xs font-bold tracking-widest uppercase`}
                >
                  {l}
                </span>
              ))}
            </div>
            {itemsLoading ? (
              <div className="px-5 py-4">
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm"
                >
                  Loading items…
                </p>
              </div>
            ) : orderItems.length === 0 ? (
              <div className="px-5 py-4">
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm italic"
                >
                  No items found
                </p>
              </div>
            ) : (
              orderItems.map((it, i) => (
                <div
                  key={i}
                  style={{ borderTop: `1px solid ${t.border}` }}
                  className="grid grid-cols-12 px-5 py-3"
                >
                  <div className="col-span-2">
                    <span
                      style={{
                        color: t.accent,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-sm font-bold"
                    >
                      {it.quantity}×
                    </span>
                  </div>
                  <div className="col-span-7">
                    <p
                      style={{
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-sm font-semibold"
                    >
                      {it.menu_name}
                    </p>
                    {it.variants?.map((v, vi) => (
                      <p
                        key={vi}
                        style={{
                          color: t.accent,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs mt-0.5"
                      >
                        · {v}
                      </p>
                    ))}
                    {it.item_note && (
                      <p
                        style={{
                          color: t.muted,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs mt-0.5 italic"
                      >
                        📝 {it.item_note}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    <span
                      style={{
                        color: t.text,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-sm font-semibold"
                    >
                      {Number(it.unit_price).toFixed(3)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notes */}
          {selectedOrder.notes && (
            <div
              style={{ borderBottom: `1px solid ${t.border}` }}
              className="px-5 py-3"
            >
              <p
                style={{ color: t.accent, fontFamily: "'Lato', sans-serif" }}
                className="text-xs font-bold tracking-widest uppercase mb-1"
              >
                Customer Notes
              </p>
              <p
                style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                className="text-sm italic"
              >
                {selectedOrder.notes}
              </p>
            </div>
          )}
          {selectedOrder.delivery_note && (
            <div
              style={{ borderBottom: `1px solid ${t.border}` }}
              className="px-5 py-3"
            >
              <p
                style={{ color: t.green, fontFamily: "'Lato', sans-serif" }}
                className="text-xs font-bold tracking-widest uppercase mb-1"
              >
                Delivery Note
              </p>
              <p
                style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                className="text-sm italic"
              >
                {selectedOrder.delivery_note}
              </p>
            </div>
          )}

          {/* Delivery rider info */}
          {selectedOrder.delivery_rider_name && (
            <div
              style={{
                borderBottom: `1px solid ${t.border}`,
                background: t.greenBg,
              }}
              className="px-5 py-3"
            >
              <p
                style={{ color: t.green, fontFamily: "'Lato', sans-serif" }}
                className="text-xs font-bold tracking-widest uppercase mb-1"
              >
                Delivery Rider
              </p>
              <p
                style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                className="text-sm font-semibold"
              >
                {selectedOrder.delivery_rider_name}
              </p>
              {selectedOrder.delivery_rider_phone && (
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs"
                >
                  {selectedOrder.delivery_rider_phone}
                </p>
              )}
            </div>
          )}

          {/* Delivery address — fetched separately for reliability */}
          {(() => {
            const addr = deliveryAddr;
            if (!addr) return null;
            const addrLine = [
              addr.apartment_no && `Apt ${addr.apartment_no}`,
              addr.floor && `Floor ${addr.floor}`,
              addr.bldg_name,
              addr.street,
              addr.block,
              addr.landmark,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <div
                style={{ borderBottom: `1px solid ${t.border}` }}
                className="px-5 py-3"
              >
                <p
                  style={{ color: t.accent, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                >
                  📍 Delivery Address
                </p>
                <p
                  style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm font-semibold mb-0.5"
                >
                  {addr.label || "Home"}
                </p>
                <p
                  style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm leading-relaxed"
                >
                  {addrLine || "No address details"}
                </p>
                {addr.latitude && addr.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: t.accent,
                      fontFamily: "'Lato', sans-serif",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    🗺️ Open in Google Maps ↗
                  </a>
                )}
                {addr.latitude && addr.longitude && (
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${addr.longitude - 0.005},${addr.latitude - 0.004},${addr.longitude + 0.005},${addr.latitude + 0.004}&layer=mapnik&marker=${addr.latitude},${addr.longitude}`}
                    title="delivery location"
                    style={{
                      width: "100%",
                      height: 130,
                      border: `1px solid ${t.border}`,
                      borderRadius: 8,
                      marginTop: 8,
                      display: "block",
                      pointerEvents: "none",
                    }}
                    scrolling="no"
                  />
                )}
              </div>
            );
          })()}

          {/* Error */}
          {actionErr && (
            <div
              className="mx-5 my-3 px-4 py-3 rounded-lg"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <p
                style={{ color: "#B83232", fontFamily: "'Lato', sans-serif" }}
                className="text-sm"
              >
                ⚠️ {actionErr}
              </p>
            </div>
          )}

          {/* Cancelled by customer notice */}
          {isCancelled && (
            <div
              className="mx-5 my-3 px-4 py-3 rounded-lg"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <p
                style={{ color: "#B83232", fontFamily: "'Lato', sans-serif", fontWeight: 700 }}
                className="text-sm mb-1"
              >
                ✕ Order Cancelled by Customer
              </p>
              <p
                style={{ color: "#B83232", fontFamily: "'Lato', sans-serif", opacity: 0.8 }}
                className="text-xs"
              >
                The customer cancelled this order before it was accepted. No action required.
              </p>
            </div>
          )}
        </div>

        {/* Action footer */}
        {!isClosed && (
          <div
            style={{ borderTop: `1px solid ${t.border}` }}
            className="px-5 py-4 flex gap-2.5 flex-shrink-0 flex-wrap"
          >
            {isPending && (
              <>
                <button
                  onClick={() => {
                    setActionErr("");
                    setShowRejectModal(true);
                  }}
                  style={{
                    border: `1px solid ${t.red}`,
                    color: t.red,
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="flex-1 min-w-[110px] py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
                >
                  ✕ Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  style={{
                    background: t.accent,
                    color: "#fff",
                    fontFamily: "'Lato', sans-serif",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                  className="flex-1 min-w-[110px] py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                >
                  {actionLoading ? "…" : "✓ Accept"}
                </button>
              </>
            )}
            {isAccepted && (
              <>
                <button
                  onClick={() => {
                    setActionErr("");
                    setShowRejectModal(true);
                  }}
                  style={{
                    border: `1px solid ${t.red}`,
                    color: t.red,
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="flex-1 min-w-[80px] py-2.5 rounded-lg text-xs font-semibold hover:opacity-80 active:scale-95 transition-all"
                >
                  ✕ Reject
                </button>
                <button
                  onClick={handlePreparing}
                  disabled={actionLoading}
                  style={{
                    background: "#7C3AED",
                    color: "#fff",
                    fontFamily: "'Lato', sans-serif",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                  className="flex-1 min-w-[110px] py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                >
                  {actionLoading ? "…" : "👨‍🍳 Preparing"}
                </button>
              </>
            )}
            {isPreparing && (
              <button
                onClick={() => {
                  setActionErr("");
                  setShowDeliveryModal(true);
                  fetchRiders();
                }}
                style={{
                  background: t.green,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                🛵 Send for Delivery
              </button>
            )}
            {isOnWay && (
              <button
                onClick={handleDelivered}
                disabled={actionLoading}
                style={{
                  background: t.green,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                  opacity: actionLoading ? 0.7 : 1,
                }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                {actionLoading ? "…" : "✅ Mark Delivered"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Tab strip with counts ──────────────────────────────────────────────────
  const TABS = [
    { id: "pending", label: "New", color: t.accent },
    { id: "accepted", label: "Accepted", color: "#2563EB" },
    { id: "preparing", label: "Preparing", color: "#7C3AED" },
    { id: "on_the_way", label: "On Way", color: t.green },
    { id: "history", label: "History", color: t.muted },
    { id: "cancelled", label: "Cancelled", color: "#B83232" },
  ];

  const TabStrip = () => (
    <div
      style={{ borderBottom: `1px solid ${t.border}` }}
      className="flex overflow-x-auto scrollbar-none"
    >
      {TABS.map(({ id, label, color }) => (
        <button
          key={id}
          onClick={() => setOrderTab(id)}
          style={{
            color: orderTab === id ? color : t.subtle,
            borderBottomColor: orderTab === id ? color : "transparent",
            fontFamily: "'Lato', sans-serif",
            flexShrink: 0,
          }}
          className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap"
        >
          {label}
          <span
            style={{
              background: orderTab === id ? color : t.surface2,
              color: orderTab === id ? "#fff" : t.muted,
            }}
            className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {byStatus[id]?.length || 0}
          </span>
        </button>
      ))}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p
          style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
          className="text-sm"
        >
          Loading orders…
        </p>
      </div>
    );
  }
  if (loadErr) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <p
          style={{ color: t.red, fontFamily: "'Lato', sans-serif" }}
          className="text-sm"
        >
          {loadErr}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-5 md:px-8 pt-6 pb-3 flex-shrink-0 flex items-center justify-between">
        <h1
          style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Orders
        </h1>
        {activeCount > 0 && (
          <span
            style={{
              background: t.accentBg,
              color: t.accent,
              border: `1px solid ${t.accentBorder}`,
              fontFamily: "'Lato', sans-serif",
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {activeCount} active
          </span>
        )}
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden lg:flex flex-1 overflow-hidden px-5 md:px-6 pb-6 gap-4">
        {/* Left: list */}
        <div
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
          className="w-72 flex-shrink-0 flex flex-col rounded-xl overflow-hidden"
        >
          <TabStrip />
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <span className="text-3xl opacity-20">🍽️</span>
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs"
                >
                  No {orderTab} orders
                </p>
              </div>
            ) : (
              displayed.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>
        {/* Right: detail */}
        {selectedOrder ? (
          <OrderDetail />
        ) : (
          <div
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
            className="flex-1 flex flex-col items-center justify-center rounded-xl gap-3"
          >
            <span className="text-5xl opacity-20">🍽️</span>
            <p
              style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
              className="text-sm"
            >
              Select an order to view details
            </p>
          </div>
        )}
      </div>

      {/* ── MOBILE layout ── */}
      <div className="lg:hidden flex-1 overflow-hidden relative">
        {/* List panel */}
        <div
          className={`absolute inset-0 flex flex-col transition-transform duration-300 ${mobileView === "list" ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: t.bg }}
        >
          <div
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <TabStrip />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <span className="text-4xl opacity-20">🍽️</span>
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm"
                >
                  No {orderTab} orders
                </p>
              </div>
            ) : (
              displayed.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>
        {/* Detail panel */}
        <div
          className={`absolute inset-0 flex flex-col transition-transform duration-300 ${mobileView === "detail" ? "translate-x-0" : "translate-x-full"}`}
          style={{ background: t.bg }}
        >
          {selectedOrder && <OrderDetail />}
        </div>
      </div>

      {/* Modals — extracted as top-level components to prevent focus loss on re-render */}
      {showRejectModal && selectedOrder && (
        <RejectOrderModal
          t={t}
          orderId={selectedOrder.id}
          onClose={() => {
            setShowRejectModal(false);
            setActionErr("");
          }}
          onConfirm={async (reason) => {
            await updateStatus(selectedOrder.id, "rejected", { notes: reason });
            setShowRejectModal(false);
          }}
        />
      )}
      {showDeliveryModal && selectedOrder && (
        <DeliveryAssignModal
          t={t}
          orderId={selectedOrder.id}
          restId={restId}
          riders={riders}
          onRiderSaved={(r) => setRiders((prev) => [...prev, r])}
          onClose={() => {
            setShowDeliveryModal(false);
            setActionErr("");
          }}
          onConfirm={async ({ riderName, riderPhone, note }) => {
            await updateStatus(selectedOrder.id, "on_the_way", {
              delivery_rider_name: riderName,
              delivery_rider_phone: riderPhone,
              delivery_note: note || null,
            });
            setShowDeliveryModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── RejectOrderModal (top-level to preserve input focus) ─────────────────────
const REJECT_REASONS_LIST = [
  "Item(s) unavailable",
  "Restaurant is closed",
  "Outside delivery zone",
  "Order too large to fulfill",
  "Customer unreachable",
  "Other",
];

function RejectOrderModal({ t, orderId, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleConfirm = async () => {
    const final = reason === "Other" ? custom.trim() : reason;
    if (!final) {
      setErr("Please select or enter a reason.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await onConfirm(final);
    } catch (e) {
      setErr(e.message || "Failed to reject order.");
      setLoading(false);
    }
  };

  return (
    <Modal title="Reject Order" onClose={onClose} t={t}>
      <p
        style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
        className="text-sm mb-4"
      >
        Select a reason for rejecting order #{orderId}. This will be recorded.
      </p>
      <div className="space-y-2 mb-4">
        {REJECT_REASONS_LIST.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            style={{
              background: reason === r ? t.accentBg : t.surface2,
              border: `1px solid ${reason === r ? t.accentBorder : t.border2}`,
              color: reason === r ? t.accent : t.text,
              fontFamily: "'Lato', sans-serif",
            }}
            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all"
          >
            {r}
          </button>
        ))}
      </div>
      {reason === "Other" && (
        <div className="mb-4">
          <label
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-bold tracking-widest uppercase block mb-2"
          >
            Specify reason
          </label>
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Enter rejection reason…"
            rows={3}
            autoFocus
            style={{
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
              resize: "none",
              width: "100%",
            }}
            className="rounded-lg px-4 py-3 text-sm outline-none"
          />
        </div>
      )}
      {err && (
        <p
          style={{ color: t.red, fontFamily: "'Lato', sans-serif" }}
          className="text-sm mb-3"
        >
          ⚠️ {err}
        </p>
      )}
      <button
        onClick={handleConfirm}
        disabled={loading || !reason}
        style={{
          background: t.red,
          color: "#fff",
          fontFamily: "'Lato', sans-serif",
          opacity: !reason ? 0.5 : 1,
        }}
        className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
      >
        {loading ? "Rejecting…" : "Confirm Rejection"}
      </button>
    </Modal>
  );
}

// ─── DeliveryAssignModal (top-level to preserve input focus) ──────────────────
function DeliveryAssignModal({
  t,
  orderId,
  restId,
  riders,
  onRiderSaved,
  onClose,
  onConfirm,
}) {
  const [selectedRider, setSelectedRider] = useState(null);
  const [directName, setDirectName] = useState("");
  const [directPhone, setDirectPhone] = useState("");
  const [note, setNote] = useState("");
  const [showAddRider, setShowAddRider] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSaveRider = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      setErr("Rider name and phone are required.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("Delivery_Riders")
        .insert({
          rest_id: restId,
          name: newName.trim(),
          phone: newPhone.trim(),
          active: true,
        })
        .select()
        .single();
      if (error) throw error;
      onRiderSaved(data);
      setSelectedRider(data);
      setNewName("");
      setNewPhone("");
      setShowAddRider(false);
    } catch (e) {
      setErr(e.message || "Failed to save rider.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const riderName = selectedRider ? selectedRider.name : directName.trim();
    const riderPhone = selectedRider ? selectedRider.phone : directPhone.trim();
    if (!riderName) {
      setErr("Please select or enter a delivery rider.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await onConfirm({ riderName, riderPhone, note });
    } catch (e) {
      setErr(e.message || "Failed to send for delivery.");
      setLoading(false);
    }
  };

  const canSubmit = selectedRider || directName.trim().length > 0;

  return (
    <Modal title="Send for Delivery" onClose={onClose} t={t}>
      <p
        style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
        className="text-sm mb-4"
      >
        Assign a delivery rider for order #{orderId}.
      </p>

      {/* Saved riders */}
      {riders.length > 0 && (
        <div className="mb-4">
          <p
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-bold tracking-widest uppercase mb-2"
          >
            Saved Riders
          </p>
          <div className="space-y-2">
            {riders.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRider(r);
                  setDirectName("");
                  setDirectPhone("");
                }}
                style={{
                  background:
                    selectedRider?.id === r.id ? t.accentBg : t.surface2,
                  border: `1px solid ${selectedRider?.id === r.id ? t.accentBorder : t.border2}`,
                  color: t.text,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all"
              >
                <span className="font-semibold">{r.name}</span>
                <span style={{ color: t.muted }} className="text-xs ml-2">
                  {r.phone}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save new rider */}
      {!showAddRider ? (
        <button
          onClick={() => {
            setShowAddRider(true);
            setSelectedRider(null);
          }}
          style={{
            color: t.accent,
            border: `1px solid ${t.accentBorder}`,
            background: t.accentBg,
            fontFamily: "'Lato', sans-serif",
          }}
          className="w-full py-2.5 rounded-lg text-sm font-semibold mb-4 hover:opacity-80 transition-opacity"
        >
          + Save new rider profile
        </button>
      ) : (
        <div
          style={{ background: t.surface2, border: `1px solid ${t.border2}` }}
          className="rounded-xl p-4 mb-4"
        >
          <p
            style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
            className="text-sm font-semibold mb-3"
          >
            New Rider Profile
          </p>
          <div className="mb-3">
            <label
              style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
              className="text-xs font-semibold tracking-widest uppercase block mb-2"
            >
              Rider Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Mohammed Ali"
              style={{
                background: t.surface,
                border: `1px solid ${t.border2}`,
                color: t.text,
                fontFamily: "'Lato', sans-serif",
              }}
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="mb-3">
            <label
              style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
              className="text-xs font-semibold tracking-widest uppercase block mb-2"
            >
              Phone Number
            </label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+965 XXXX XXXX"
              style={{
                background: t.surface,
                border: `1px solid ${t.border2}`,
                color: t.text,
                fontFamily: "'Lato', sans-serif",
              }}
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddRider(false)}
              style={{
                color: t.subtle,
                border: `1px solid ${t.border2}`,
                fontFamily: "'Lato', sans-serif",
              }}
              className="flex-1 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRider}
              disabled={loading}
              style={{
                background: t.accent,
                color: "#fff",
                fontFamily: "'Lato', sans-serif",
              }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold"
            >
              {loading ? "Saving…" : "Save & Select"}
            </button>
          </div>
        </div>
      )}

      {/* Direct entry */}
      <div style={{ borderTop: `1px solid ${t.border}` }} className="pt-4 mb-4">
        <p
          style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
          className="text-xs font-bold tracking-widest uppercase mb-3"
        >
          Or Enter Directly (one-time)
        </p>
        <div className="mb-3">
          <label
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-semibold tracking-widest uppercase block mb-2"
          >
            Rider Name
          </label>
          <input
            type="text"
            value={directName}
            onChange={(e) => {
              setDirectName(e.target.value);
              setSelectedRider(null);
            }}
            placeholder="Name"
            style={{
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
            }}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
          />
        </div>
        <div className="mb-3">
          <label
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-semibold tracking-widest uppercase block mb-2"
          >
            Phone
          </label>
          <input
            type="text"
            value={directPhone}
            onChange={(e) => {
              setDirectPhone(e.target.value);
              setSelectedRider(null);
            }}
            placeholder="Phone number"
            style={{
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
            }}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      {/* Delivery note */}
      <div className="mb-4">
        <label
          style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
          className="text-xs font-semibold tracking-widest uppercase block mb-2"
        >
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any delivery instructions…"
          rows={2}
          style={{
            background: t.surface2,
            border: `1px solid ${t.border2}`,
            color: t.text,
            fontFamily: "'Lato', sans-serif",
            resize: "none",
            width: "100%",
          }}
          className="rounded-lg px-4 py-3 text-sm outline-none"
        />
      </div>

      {err && (
        <p
          style={{ color: t.red, fontFamily: "'Lato', sans-serif" }}
          className="text-sm mb-3"
        >
          ⚠️ {err}
        </p>
      )}
      <button
        onClick={handleConfirm}
        disabled={loading || !canSubmit}
        style={{
          background: t.green,
          color: "#fff",
          fontFamily: "'Lato', sans-serif",
          opacity: !canSubmit ? 0.5 : 1,
        }}
        className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
      >
        {loading ? "Sending…" : "🛵 Confirm — Send for Delivery"}
      </button>
    </Modal>
  );
}

// ─── Add-On Item Row ──────────────────────────────────────────────────────────
function AddonItemRow({ addon, t, onEdit, onDelete }) {
  const imgSrc =
    addon.image_path && addon.image_path.trim() !== ""
      ? addon.image_path
      : "/sides.jpg";

  return (
    <div
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
      className="flex items-center gap-3 rounded-xl px-4 py-3"
    >
      <div
        style={{ background: t.surface2, border: `1px solid ${t.border}` }}
        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
      >
        <img
          src={imgSrc}
          alt={addon.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = "/sides.jpg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
          className="text-sm font-semibold"
        >
          {addon.name}
        </p>
        <p
          style={{ color: t.accent, fontFamily: "'Lato', sans-serif" }}
          className="text-xs font-bold mt-0.5"
        >
          KD {Number(addon.price ?? 0).toFixed(3)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          style={{ color: t.subtle }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-60 transition-opacity text-sm"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          style={{ color: t.subtle }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-red-500 transition-colors text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ─── Menu Page ────────────────────────────────────────────────────────────────
function MenuPage({ t, user }) {
  // categories shape: { id, name, visible, sort_order, items: [...] }
  // items shape: { id, name, price, is_available, visible, description, image_path, sort_order, categ_id, rest_id }
  const [categories, setCategories] = useState([]);
  // ── Add-Ons DB state ──────────────────────────────────────────────────────
  const [addonTypes, setAddonTypes] = useState([]); // Add_Ons_Type rows
  const [addonItems, setAddonItems] = useState([]); // Add_Ons rows
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [itemOrderDirty, setItemOrderDirty] = useState(false);
  const [savingItemOrder, setSavingItemOrder] = useState(false);
  // Snapshots of last-saved order for dirty detection
  const savedCatOrder = useRef([]);
  const savedItemOrder = useRef({});

  const [section, setSection] = useState("menu");
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("categories");
  const [showAddCat, setShowAddCat] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingAddon, setEditingAddon] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [savingCatName, setSavingCatName] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    description: "",
    imageFile: null,
    imagePreview: null,
    imageError: "",
    avail_from: "", // "HH:MM" Kuwait time, "" = no limit
    avail_to: "", // "HH:MM" Kuwait time, "" = no limit
  });
  const [addonForm, setAddonForm] = useState({
    // shared
    name: "",
    price: "",
    imageFile: null,
    imagePreview: null,
    imageError: "",
    // for item: which type (null = uncategorized)
    typeId: null,
    // for type modal
    minQty: "",
  });
  const [showAddonTypeModal, setShowAddonTypeModal] = useState(false);
  const [editingAddonType, setEditingAddonType] = useState(null);
  const [addonTypeForm, setAddonTypeForm] = useState({ name: "", minQty: "" });
  const [confirmDeleteAddon, setConfirmDeleteAddon] = useState(null); // { kind: "type"|"item", id, name }
  const [savingAddon, setSavingAddon] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  // Confirm-delete dialog: { type: "cat"|"item", catId, itemId, name }
  const [confirmDelete, setConfirmDelete] = useState(null);
  // Time-limit override warning: item that user tried to toggle against its window
  const [timeBlockedItem, setTimeBlockedItem] = useState(null);

  // ── Variant Groups modal state ─────────────────────────────────────────────
  // variantItem: the menu item whose variants we are editing
  const [variantItem, setVariantItem] = useState(null);
  // variantGroups: [{ id?, name, is_required, is_multiple, options: [{ id?, name, price_adj }] }]
  const [variantGroups, setVariantGroups] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [savingVariants, setSavingVariants] = useState(false);

  // Derive rest_id from user role
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;

  // ── Kuwait time helpers (UTC+3, no DST) ───────────────────────────────────
  const getKuwaitHHMM = () => {
    const now = new Date();
    const totalMins =
      (now.getUTCHours() * 60 + now.getUTCMinutes() + 180) % 1440;
    return `${String(Math.floor(totalMins / 60)).padStart(2, "0")}:${String(totalMins % 60).padStart(2, "0")}`;
  };

  // Returns "in-window" | "out-window" | "no-limit"
  // Handles overnight spans e.g. 22:00 → 02:00
  const getWindowStatus = (avail_from, avail_to) => {
    if (!avail_from || !avail_to) return "no-limit";
    const now = getKuwaitHHMM();
    const overnight = avail_to <= avail_from; // e.g. 22:00 → 02:00
    const inWindow = overnight
      ? now >= avail_from || now < avail_to
      : now >= avail_from && now < avail_to;
    return inWindow ? "in-window" : "out-window";
  };

  // Auto-check every minute: set is_available based on window, reset at avail_from
  useEffect(() => {
    const tick = async () => {
      const nowHHMM = getKuwaitHHMM();
      const toUpdate = []; // { id, is_available }
      setCategories((prev) => {
        const next = prev.map((c) => ({
          ...c,
          items: c.items.map((item) => {
            const { avail_from, avail_to } = item;
            if (!avail_from || !avail_to) return item;
            const status = getWindowStatus(avail_from, avail_to);
            // At the start of the window → restore to In Stock
            if (nowHHMM === avail_from.slice(0, 5) && !item.is_available) {
              toUpdate.push({ id: item.id, is_available: true });
              return { ...item, is_available: true };
            }
            // Outside window → mark Out of Stock
            if (status === "out-window" && item.is_available) {
              toUpdate.push({ id: item.id, is_available: false });
              return { ...item, is_available: false };
            }
            return item;
          }),
        }));
        return next;
      });
      for (const { id, is_available } of toUpdate) {
        await supabase.from("Menu").update({ is_available }).eq("id", id);
      }
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect touch-primary device (used to swap drag handle for arrow buttons)
  const isTouch = useRef(
    typeof window !== "undefined" &&
      (navigator.maxTouchPoints > 0 || "ontouchstart" in window),
  ).current;

  // ── Arrow-based reorder helpers (mobile) ───────────────────────────────────
  const moveCat = (index, dir) => {
    const next = [...categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    setOrderDirty(true);
  };

  const moveItem = (index, dir) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCatId) return c;
        const items = [...c.items];
        const target = index + dir;
        if (target < 0 || target >= items.length) return c;
        [items[index], items[target]] = [items[target], items[index]];
        return { ...c, items };
      }),
    );
    setItemOrderDirty(true);
  };

  // ── Fetch categories + items on mount ──────────────────────────────────────
  useEffect(() => {
    if (!restId) {
      setLoading(false);
      setLoadError("No restaurant associated with this account.");
      return;
    }
    const fetchMenu = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Fetch categories sorted by sort_order asc
        const { data: cats, error: catErr } = await supabase
          .from("Categories")
          .select("id, name, visible, sort_order")
          .eq("rest_id", restId)
          .order("sort_order", { ascending: true });

        if (catErr) throw catErr;

        if (!cats || cats.length === 0) {
          setCategories([]);
          setSelectedCatId(null);
          setLoading(false);
          return;
        }

        // Fetch all menu items for this restaurant
        const { data: items, error: itemErr } = await supabase
          .from("Menu")
          .select(
            "id, name, price, is_available, visible, description, image_path, sort_order, categ_id, avail_from, avail_to, is_customizable, is_popular",
          )
          .eq("rest_id", restId)
          .order("sort_order", { ascending: true });

        if (itemErr) throw itemErr;

        // Group items by category
        const itemsBycat = {};
        (items || []).forEach((item) => {
          const cid = item.categ_id;
          if (!itemsBycat[cid]) itemsBycat[cid] = [];
          itemsBycat[cid].push({ ...item });
        });

        const built = cats.map((c) => ({
          ...c,
          enabled: c.visible,
          items: itemsBycat[c.id] || [],
        }));

        setCategories(built);
        setSelectedCatId(built[0]?.id || null);
        // Snapshot DB order for dirty detection
        savedCatOrder.current = built.map((c) => c.id);
        savedItemOrder.current = Object.fromEntries(
          built.map((c) => [c.id, c.items.map((i) => i.id)]),
        );
      } catch (err) {
        console.error(err);
        setLoadError("Failed to load menu. " + (err.message || ""));
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();

    // ── Real-time: Menu + Categories changes ─────────────────────────────────
    const menuChannel = supabase
      .channel(`menu-rt-${restId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Menu",
          filter: `rest_id=eq.${restId}`,
        },
        (payload) => {
          // Update matching item in local state without a full refetch
          setCategories((prev) =>
            prev.map((c) => ({
              ...c,
              items: c.items.map((it) =>
                it.id === payload.new.id ? { ...it, ...payload.new } : it,
              ),
            })),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Menu",
          filter: `rest_id=eq.${restId}`,
        },
        () => {
          // Full refetch on new item (need to rebuild category grouping)
          fetchMenu();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Menu",
        },
        (payload) => {
          setCategories((prev) =>
            prev.map((c) => ({
              ...c,
              items: c.items.filter((it) => it.id !== payload.old.id),
            })),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Categories",
          filter: `rest_id=eq.${restId}`,
        },
        () => {
          fetchMenu();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(menuChannel);
    };
  }, [restId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag refs ───────────────────────────────────────────────────────────────
  const dragCat = useRef(null);
  const overCat = useRef(null);
  const dragItem = useRef(null);
  const overItem = useRef(null);

  const catTouchDrag = useTouchDrag(
    categories,
    (updater) => {
      setCategories((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        setOrderDirty(true);
        return next;
      });
    },
    (c) => c.id,
  );

  const selectedCat =
    categories.find((c) => c.id === selectedCatId) || categories[0];
  const catItems = selectedCat?.items || [];

  const setItemsForCat = useCallback(
    (updater) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCatId
            ? {
                ...c,
                items:
                  typeof updater === "function" ? updater(c.items) : updater,
              }
            : c,
        ),
      );
    },
    [selectedCatId],
  );

  const itemTouchDrag = useTouchDrag(catItems, setItemsForCat, (i) => i.id);

  const onCatDrop = () => {
    if (dragCat.current === null || overCat.current === null) return;
    const next = [...categories];
    const [m] = next.splice(dragCat.current, 1);
    next.splice(overCat.current, 0, m);
    setCategories(next);
    setOrderDirty(true);
    dragCat.current = null;
    overCat.current = null;
  };

  const onItemDrop = (catId) => {
    if (
      !dragItem.current ||
      !overItem.current ||
      dragItem.current === overItem.current
    )
      return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const items = [...c.items];
        const fi = items.findIndex((x) => x.id === dragItem.current);
        const ti = items.findIndex((x) => x.id === overItem.current);
        const [m] = items.splice(fi, 1);
        items.splice(ti, 0, m);
        return { ...c, items };
      }),
    );
    setItemOrderDirty(true);
    dragItem.current = null;
    overItem.current = null;
  };

  // ── Save category sort_order to DB ─────────────────────────────────────────
  const saveCategoryOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = categories.map((c, i) =>
        supabase
          .from("Categories")
          .update({ sort_order: i + 1 })
          .eq("id", c.id),
      );
      await Promise.all(updates);
      // reflect new sort_order in local state
      setCategories((prev) =>
        prev.map((c, i) => ({ ...c, sort_order: i + 1 })),
      );
      setOrderDirty(false);
    } catch (err) {
      console.error("Failed to save order:", err);
    } finally {
      setSavingOrder(false);
    }
  };

  // ── Save item sort_order to DB ─────────────────────────────────────────────
  const saveItemOrder = async () => {
    if (!selectedCat) return;
    setSavingItemOrder(true);
    try {
      const updates = selectedCat.items.map((item, i) =>
        supabase
          .from("Menu")
          .update({ sort_order: i + 1 })
          .eq("id", item.id),
      );
      await Promise.all(updates);
      setCategories((prev) =>
        prev.map((c) =>
          c.id !== selectedCatId
            ? c
            : {
                ...c,
                items: c.items.map((item, i) => ({
                  ...item,
                  sort_order: i + 1,
                })),
              },
        ),
      );
      setItemOrderDirty(false);
    } catch (err) {
      console.error("Failed to save item order:", err);
    } finally {
      setSavingItemOrder(false);
    }
  };

  // ── Category visible toggle → immediate DB ─────────────────────────────────
  const toggleCat = async (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    const newVal = !cat.visible;
    // Optimistic update
    setCategories((p) =>
      p.map((c) =>
        c.id === id ? { ...c, visible: newVal, enabled: newVal } : c,
      ),
    );
    const { error } = await supabase
      .from("Categories")
      .update({ visible: newVal })
      .eq("id", id);
    if (error) {
      // Revert on failure
      setCategories((p) =>
        p.map((c) =>
          c.id === id ? { ...c, visible: !newVal, enabled: !newVal } : c,
        ),
      );
      console.error("Failed to toggle category visibility:", error);
    }
  };

  // ── Delete category → DB ───────────────────────────────────────────────────
  const confirmDeleteCat = (id) => {
    const cat = categories.find((c) => c.id === id);
    setConfirmDelete({
      type: "cat",
      catId: id,
      name: cat?.name || "this category",
    });
  };

  const executeDeleteCat = async () => {
    const { catId } = confirmDelete;
    setConfirmDelete(null);
    const remaining = categories.filter((c) => c.id !== catId);
    const resequenced = remaining.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories(resequenced);
    if (selectedCatId === catId) setSelectedCatId(resequenced[0]?.id || null);
    setMobilePanel("categories");
    savedCatOrder.current = resequenced.map((c) => c.id);
    try {
      const { error: delErr } = await supabase
        .from("Categories")
        .delete()
        .eq("id", catId);
      if (delErr) throw delErr;
      if (resequenced.length > 0) {
        await Promise.all(
          resequenced.map((c) =>
            supabase
              .from("Categories")
              .update({ sort_order: c.sort_order })
              .eq("id", c.id),
          ),
        );
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      window.location.reload();
    }
  };

  // ── Rename category → immediate DB ────────────────────────────────────────
  const renameCat = async () => {
    const trimmed = editingCatName.trim();
    if (!trimmed || !editingCatId) {
      setEditingCatId(null);
      return;
    }
    const original = categories.find((c) => c.id === editingCatId)?.name;
    if (trimmed === original) {
      setEditingCatId(null);
      return;
    }
    setSavingCatName(true);
    // Optimistic update
    setCategories((p) =>
      p.map((c) => (c.id === editingCatId ? { ...c, name: trimmed } : c)),
    );
    const { error } = await supabase
      .from("Categories")
      .update({ name: trimmed })
      .eq("id", editingCatId);
    if (error) {
      console.error("Failed to rename category:", error);
      setCategories((p) =>
        p.map((c) => (c.id === editingCatId ? { ...c, name: original } : c)),
      );
    }
    setSavingCatName(false);
    setEditingCatId(null);
  };

  // ── Item visible toggle → immediate DB ────────────────────────────────────
  const toggleItem = async (cid, iid) => {
    const cat = categories.find((c) => c.id === cid);
    const item = cat?.items.find((i) => i.id === iid);
    if (!item) return;
    const newVal = !item.visible;
    setCategories((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              items: c.items.map((i) =>
                i.id === iid ? { ...i, visible: newVal } : i,
              ),
            },
      ),
    );
    const { error } = await supabase
      .from("Menu")
      .update({ visible: newVal })
      .eq("id", iid);
    if (error) {
      setCategories((p) =>
        p.map((c) =>
          c.id !== cid
            ? c
            : {
                ...c,
                items: c.items.map((i) =>
                  i.id === iid ? { ...i, visible: !newVal } : i,
                ),
              },
        ),
      );
      console.error("Failed to toggle item visibility:", error);
    }
  };

  // ── Item is_popular toggle → immediate DB ─────────────────────────────────
  const toggleItemPopular = async (cid, iid) => {
    const cat = categories.find((c) => c.id === cid);
    const item = cat?.items.find((i) => i.id === iid);
    if (!item) return;
    const newVal = !item.is_popular;
    // Optimistic update
    setCategories((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              items: c.items.map((i) =>
                i.id === iid ? { ...i, is_popular: newVal } : i,
              ),
            },
      ),
    );
    const { error } = await supabase
      .from("Menu")
      .update({ is_popular: newVal })
      .eq("id", iid);
    if (error) {
      // Revert on failure
      setCategories((p) =>
        p.map((c) =>
          c.id !== cid
            ? c
            : {
                ...c,
                items: c.items.map((i) =>
                  i.id === iid ? { ...i, is_popular: !newVal } : i,
                ),
              },
        ),
      );
      console.error("Failed to toggle popular:", error);
    }
  };
  const toggleItemStock = async (cid, iid) => {
    const cat = categories.find((c) => c.id === cid);
    const item = cat?.items.find((i) => i.id === iid);
    if (!item) return;

    const status = getWindowStatus(item.avail_from, item.avail_to);

    // Trying to mark In Stock but outside the time window → block and warn
    if (!item.is_available && status === "out-window") {
      setTimeBlockedItem(item);
      return;
    }

    const newVal = !item.is_available;
    setCategories((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              items: c.items.map((i) =>
                i.id === iid ? { ...i, is_available: newVal } : i,
              ),
            },
      ),
    );
    const { error } = await supabase
      .from("Menu")
      .update({ is_available: newVal })
      .eq("id", iid);
    if (error) {
      setCategories((p) =>
        p.map((c) =>
          c.id !== cid
            ? c
            : {
                ...c,
                items: c.items.map((i) =>
                  i.id === iid ? { ...i, is_available: !newVal } : i,
                ),
              },
        ),
      );
      console.error("Failed to toggle item stock:", error);
    }
  };

  // ── Delete item → confirmation then DB ────────────────────────────────────
  const confirmDeleteItem = (cid, iid) => {
    const item = categories
      .find((c) => c.id === cid)
      ?.items.find((i) => i.id === iid);
    setConfirmDelete({
      type: "item",
      catId: cid,
      itemId: iid,
      name: item?.name || "this item",
    });
  };

  const executeDeleteItem = async () => {
    const { catId, itemId } = confirmDelete;
    setConfirmDelete(null);
    const cat = categories.find((c) => c.id === catId);
    const remaining = (cat?.items || []).filter((i) => i.id !== itemId);
    const resequenced = remaining.map((item, i) => ({
      ...item,
      sort_order: i + 1,
    }));
    setCategories((p) =>
      p.map((c) => (c.id !== catId ? c : { ...c, items: resequenced })),
    );
    savedItemOrder.current = {
      ...savedItemOrder.current,
      [catId]: resequenced.map((i) => i.id),
    };
    try {
      const { error: delErr } = await supabase
        .from("Menu")
        .delete()
        .eq("id", itemId);
      if (delErr) throw delErr;
      if (resequenced.length > 0) {
        await Promise.all(
          resequenced.map((item) =>
            supabase
              .from("Menu")
              .update({ sort_order: item.sort_order })
              .eq("id", item.id),
          ),
        );
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // ── Open item modal ────────────────────────────────────────────────────────
  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: "",
      price: "",
      description: "",
      imageFile: null,
      imagePreview: null,
      imageError: "",
      avail_from: "",
      avail_to: "",
    });
    setShowItemModal(true);
  };
  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      price: String(item.price),
      description: item.description || "",
      imageFile: null,
      imagePreview:
        item.image_path && item.image_path.trim() !== ""
          ? item.image_path
          : null,
      imageError: "",
      avail_from: item.avail_from ? item.avail_from.slice(0, 5) : "",
      avail_to: item.avail_to ? item.avail_to.slice(0, 5) : "",
    });
    setShowItemModal(true);
  };

  // ── Save item → INSERT or UPDATE DB ───────────────────────────────────────
  const saveItem = async () => {
    // ── Client-side validation ───────────────────────────────────────────────
    if (!itemForm.name.trim()) {
      setItemForm((f) => ({ ...f, imageError: "Item name is required." }));
      return;
    }
    const p = parseFloat(itemForm.price);
    if (isNaN(p) || p < 0) {
      setItemForm((f) => ({
        ...f,
        imageError: "Price must be a valid positive number.",
      }));
      return;
    }
    if (!restId) {
      setItemForm((f) => ({
        ...f,
        imageError: "No restaurant found. Please re-login.",
      }));
      return;
    }
    if (!selectedCatId) {
      setItemForm((f) => ({ ...f, imageError: "No category selected." }));
      return;
    }

    setSavingItem(true);
    setItemForm((f) => ({ ...f, imageError: "" }));

    try {
      // ── Upload image if a new file was selected ──────────────────────────
      let imagePath = editingItem?.image_path || "/foodlogo.jpg";

      if (itemForm.imageFile) {
        const bucketName = "feastrush-menu";
        const ext = itemForm.imageFile.name.split(".").pop().toLowerCase();
        const filePath = `${restId}/menu/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        console.log(
          "[saveItem] Uploading to bucket:",
          bucketName,
          "path:",
          filePath,
        );

        const { error: uploadErr } = await supabase.storage
          .from(bucketName)
          .upload(filePath, itemForm.imageFile, { upsert: false });

        if (uploadErr) {
          console.error("[saveItem] Upload error:", uploadErr);
          throw new Error("Image upload failed: " + uploadErr.message);
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        imagePath = urlData?.publicUrl || "/foodlogo.jpg";
        console.log("[saveItem] Image public URL:", imagePath);
      }

      // ── UPDATE existing item ─────────────────────────────────────────────
      if (editingItem) {
        const updates = {
          name: itemForm.name.trim(),
          price: p,
          description: itemForm.description.trim() || null,
          avail_from: itemForm.avail_from || null,
          avail_to: itemForm.avail_to || null,
        };
        if (itemForm.imageFile) updates.image_path = imagePath;

        console.log("[saveItem] Updating item id:", editingItem.id, updates);

        const { error } = await supabase
          .from("Menu")
          .update(updates)
          .eq("id", editingItem.id);

        if (error) {
          console.error("[saveItem] Update error:", error);
          throw new Error(error.message || "Failed to update item.");
        }

        setCategories((prev) =>
          prev.map((c) =>
            c.id !== selectedCatId
              ? c
              : {
                  ...c,
                  items: c.items.map((i) =>
                    i.id === editingItem.id
                      ? {
                          ...i,
                          name: itemForm.name.trim(),
                          price: p,
                          description: itemForm.description.trim() || null,
                          avail_from: itemForm.avail_from || null,
                          avail_to: itemForm.avail_to || null,
                          image_path: itemForm.imageFile
                            ? imagePath
                            : i.image_path,
                        }
                      : i,
                  ),
                },
          ),
        );

        // ── INSERT new item ──────────────────────────────────────────────────
      } else {
        const sortOrder = (selectedCat?.items?.length || 0) + 1;
        const payload = {
          rest_id: restId,
          categ_id: selectedCatId,
          name: itemForm.name.trim(),
          price: p,
          description: itemForm.description.trim() || null,
          image_path: imagePath,
          is_available: true,
          visible: true,
          is_popular: false,
          sort_order: sortOrder,
          avail_from: itemForm.avail_from || null,
          avail_to: itemForm.avail_to || null,
        };

        console.log("[saveItem] Inserting payload:", payload);

        const { data, error } = await supabase
          .from("Menu")
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error("[saveItem] Insert error:", error);
          throw new Error(error.message || "Failed to insert item.");
        }

        console.log("[saveItem] Inserted successfully:", data);

        setCategories((prev) =>
          prev.map((c) =>
            c.id !== selectedCatId
              ? c
              : { ...c, items: [...c.items, { ...data }] },
          ),
        );

        // Update item order snapshot for new item
        savedItemOrder.current = {
          ...savedItemOrder.current,
          [selectedCatId]: [
            ...(savedItemOrder.current[selectedCatId] || []),
            data.id,
          ],
        };
      }

      setShowItemModal(false);
    } catch (err) {
      console.error("[saveItem] Caught error:", err);
      setItemForm((f) => ({
        ...f,
        imageError: err.message || "Something went wrong. Please try again.",
      }));
    } finally {
      setSavingItem(false);
    }
  };

  // ── Open Variant Groups modal for a menu item ──────────────────────────────
  const openVariants = async (item) => {
    setVariantItem(item);
    setLoadingVariants(true);
    try {
      const { data: groups, error: gErr } = await supabase
        .from("Variant_Groups")
        .select("id, name, is_required, is_multiple")
        .eq("menu_id", item.id)
        .order("id", { ascending: true });
      if (gErr) throw gErr;

      const groupIds = (groups || []).map((g) => g.id);
      let options = [];
      if (groupIds.length > 0) {
        const { data: opts, error: oErr } = await supabase
          .from("Variant Options")
          .select("id, var_group_id, name, price_adj")
          .in("var_group_id", groupIds)
          .order("id", { ascending: true });
        if (oErr) throw oErr;
        options = opts || [];
      }

      setVariantGroups(
        (groups || []).map((g) => ({
          ...g,
          options: options.filter((o) => o.var_group_id === g.id),
        })),
      );
    } catch (err) {
      console.error("[openVariants] error:", err);
      alert("Failed to load variants: " + (err.message || "Unknown error"));
    } finally {
      setLoadingVariants(false);
    }
  };

  const closeVariants = () => {
    setVariantItem(null);
    setVariantGroups([]);
  };

  const addVariantGroup = () => {
    setVariantGroups((prev) => [
      ...prev,
      {
        _localId: Date.now(),
        name: "",
        is_required: false,
        is_multiple: false,
        options: [],
      },
    ]);
  };

  const updateVariantGroup = (idx, key, val) => {
    setVariantGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, [key]: val } : g)),
    );
  };

  const removeVariantGroup = (idx) => {
    setVariantGroups((prev) => prev.filter((_, i) => i !== idx));
  };

  const addVariantOption = (groupIdx) => {
    setVariantGroups((prev) =>
      prev.map((g, i) =>
        i !== groupIdx
          ? g
          : {
              ...g,
              options: [
                ...g.options,
                { _localId: Date.now(), name: "", price_adj: 0 },
              ],
            },
      ),
    );
  };

  const updateVariantOption = (groupIdx, optIdx, key, val) => {
    setVariantGroups((prev) =>
      prev.map((g, i) =>
        i !== groupIdx
          ? g
          : {
              ...g,
              options: g.options.map((o, j) =>
                j !== optIdx ? o : { ...o, [key]: val },
              ),
            },
      ),
    );
  };

  const removeVariantOption = (groupIdx, optIdx) => {
    setVariantGroups((prev) =>
      prev.map((g, i) =>
        i !== groupIdx
          ? g
          : { ...g, options: g.options.filter((_, j) => j !== optIdx) },
      ),
    );
  };

  const saveVariants = async () => {
    if (!variantItem) return;
    // Basic validation
    for (const g of variantGroups) {
      if (!g.name.trim()) {
        alert("Each variant group must have a name.");
        return;
      }
      for (const o of g.options) {
        if (!o.name.trim()) {
          alert(`All options in "${g.name}" must have a name.`);
          return;
        }
      }
    }

    setSavingVariants(true);
    try {
      // 1. Fetch existing groups from DB to know what to delete
      const { data: existingGroups } = await supabase
        .from("Variant_Groups")
        .select("id")
        .eq("menu_id", variantItem.id);

      const existingGroupIds = (existingGroups || []).map((g) => g.id);
      const newGroupIds = variantGroups.filter((g) => g.id).map((g) => g.id);
      const groupsToDelete = existingGroupIds.filter(
        (id) => !newGroupIds.includes(id),
      );

      // Delete removed groups (cascade deletes their options via FK)
      if (groupsToDelete.length > 0) {
        // First delete options for these groups
        await supabase
          .from("Variant Options")
          .delete()
          .in("var_group_id", groupsToDelete);
        await supabase.from("Variant_Groups").delete().in("id", groupsToDelete);
      }

      // 2. Upsert each group + its options
      for (const group of variantGroups) {
        if (group.id) {
          // UPDATE existing group
          await supabase
            .from("Variant_Groups")
            .update({
              name: group.name.trim(),
              is_required: group.is_required,
              is_multiple: group.is_multiple,
            })
            .eq("id", group.id);

          // Fetch existing options for this group
          const { data: existingOpts } = await supabase
            .from("Variant Options")
            .select("id")
            .eq("var_group_id", group.id);
          const existingOptIds = (existingOpts || []).map((o) => o.id);
          const newOptIds = group.options.filter((o) => o.id).map((o) => o.id);
          const optsToDelete = existingOptIds.filter(
            (id) => !newOptIds.includes(id),
          );
          if (optsToDelete.length > 0) {
            await supabase
              .from("Variant Options")
              .delete()
              .in("id", optsToDelete);
          }
          for (const opt of group.options) {
            if (opt.id) {
              await supabase
                .from("Variant Options")
                .update({
                  name: opt.name.trim(),
                  price_adj: parseFloat(opt.price_adj) || 0,
                })
                .eq("id", opt.id);
            } else {
              await supabase.from("Variant Options").insert({
                var_group_id: group.id,
                name: opt.name.trim(),
                price_adj: parseFloat(opt.price_adj) || 0,
              });
            }
          }
        } else {
          // INSERT new group
          const { data: newGroup, error: ngErr } = await supabase
            .from("Variant_Groups")
            .insert({
              menu_id: variantItem.id,
              name: group.name.trim(),
              is_required: group.is_required,
              is_multiple: group.is_multiple,
            })
            .select()
            .single();
          if (ngErr) throw ngErr;
          for (const opt of group.options) {
            await supabase.from("Variant Options").insert({
              var_group_id: newGroup.id,
              name: opt.name.trim(),
              price_adj: parseFloat(opt.price_adj) || 0,
            });
          }
        }
      }

      // 3. Update is_customizable on the Menu item
      const isCustomizable = variantGroups.length > 0;
      await supabase
        .from("Menu")
        .update({ is_customizable: isCustomizable })
        .eq("id", variantItem.id);

      // 4. Update local state
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === variantItem.id
              ? { ...i, is_customizable: isCustomizable }
              : i,
          ),
        })),
      );

      closeVariants();
    } catch (err) {
      console.error("[saveVariants] error:", err);
      alert("Failed to save variants: " + (err.message || "Unknown error"));
    } finally {
      setSavingVariants(false);
    }
  };

  // ── Fetch Add-Ons types + items from DB ────────────────────────────────────
  const fetchAddons = useCallback(async () => {
    if (!restId) return;
    setLoadingAddons(true);
    try {
      const { data: types, error: tErr } = await supabase
        .from("Add_Ons_Type")
        .select("id, name, min_qty, rest_id")
        .eq("rest_id", restId)
        .order("id", { ascending: true });
      if (tErr) throw tErr;

      const { data: items, error: iErr } = await supabase
        .from("Add_Ons")
        .select("id, type_id, name, price, image_path");
      // Filter client-side: items that belong to one of this restaurant's types OR have no type
      // We'll only show items whose type_id is in this restaurant's types, or type_id IS NULL
      // But we need to scope uncategorised ones to this restaurant — the schema has no rest_id on Add_Ons.
      // So we filter: type_id in types[], or type_id is null (shown as uncategorized — all restaurants share these).
      // Best practice: show only items whose type_id is in this restaurant's type ids.
      // Uncategorized: items whose type_id IS NULL — these are considered "restaurant-generic" by the schema.
      if (iErr) throw iErr;

      const typeIds = new Set((types || []).map((t) => t.id));
      const filtered = (items || []).filter(
        (a) => a.type_id === null || typeIds.has(a.type_id),
      );

      setAddonTypes(types || []);
      setAddonItems(filtered);
    } catch (err) {
      console.error("[fetchAddons] error:", err);
    } finally {
      setLoadingAddons(false);
    }
  }, [restId]);

  useEffect(() => {
    if (section === "addons") fetchAddons();
  }, [section, fetchAddons]);

  // ── Open Add-On TYPE modal ─────────────────────────────────────────────────
  const openAddType = () => {
    setEditingAddonType(null);
    setAddonTypeForm({ name: "", minQty: "" });
    setShowAddonTypeModal(true);
  };
  const openEditType = (type) => {
    setEditingAddonType(type);
    setAddonTypeForm({ name: type.name, minQty: String(type.min_qty ?? "") });
    setShowAddonTypeModal(true);
  };

  const saveAddonType = async () => {
    if (!addonTypeForm.name.trim()) {
      return;
    }
    setSavingAddon(true);
    try {
      if (editingAddonType) {
        const { error } = await supabase
          .from("Add_Ons_Type")
          .update({
            name: addonTypeForm.name.trim(),
            min_qty: parseInt(addonTypeForm.minQty) || 0,
          })
          .eq("id", editingAddonType.id);
        if (error) throw error;
        setAddonTypes((prev) =>
          prev.map((t) =>
            t.id === editingAddonType.id
              ? {
                  ...t,
                  name: addonTypeForm.name.trim(),
                  min_qty: parseInt(addonTypeForm.minQty) || 0,
                }
              : t,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("Add_Ons_Type")
          .insert({
            rest_id: restId,
            name: addonTypeForm.name.trim(),
            min_qty: parseInt(addonTypeForm.minQty) || 0,
          })
          .select()
          .single();
        if (error) throw error;
        setAddonTypes((prev) => [...prev, data]);
      }
      setShowAddonTypeModal(false);
    } catch (err) {
      console.error("[saveAddonType] error:", err);
      alert("Failed to save type: " + (err.message || "Unknown error"));
    } finally {
      setSavingAddon(false);
    }
  };

  const executeDeleteAddonType = async () => {
    if (!confirmDeleteAddon || confirmDeleteAddon.kind !== "type") return;
    const { id } = confirmDeleteAddon;
    setConfirmDeleteAddon(null);
    try {
      // Nullify type_id for items belonging to this type (they become uncategorized)
      await supabase
        .from("Add_Ons")
        .update({ type_id: null })
        .eq("type_id", id);
      const { error } = await supabase
        .from("Add_Ons_Type")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setAddonTypes((prev) => prev.filter((t) => t.id !== id));
      setAddonItems((prev) =>
        prev.map((a) => (a.type_id === id ? { ...a, type_id: null } : a)),
      );
    } catch (err) {
      console.error("[deleteAddonType] error:", err);
      alert("Failed to delete type: " + (err.message || "Unknown error"));
    }
  };

  // ── Open Add-On ITEM modal ─────────────────────────────────────────────────
  const openAddAddonItem = (typeId) => {
    setEditingAddon(null);
    setAddonForm({
      name: "",
      price: "",
      imageFile: null,
      imagePreview: null,
      imageError: "",
      typeId: typeId || null,
      minQty: "",
    });
    setShowAddonModal(true);
  };
  const openAddAddon = () => openAddAddonItem(null);

  const openEditAddonItem = (addon) => {
    setEditingAddon(addon);
    setAddonForm({
      name: addon.name,
      price: String(addon.price ?? ""),
      imageFile: null,
      imagePreview:
        addon.image_path && addon.image_path.trim() !== ""
          ? addon.image_path
          : null,
      imageError: "",
      typeId: addon.type_id ?? null,
      minQty: "",
    });
    setShowAddonModal(true);
  };

  const saveAddon = async () => {
    if (!addonForm.name.trim()) {
      setAddonForm((f) => ({ ...f, imageError: "Name is required." }));
      return;
    }
    const p = parseFloat(addonForm.price);
    if (isNaN(p) || p < 0) {
      setAddonForm((f) => ({
        ...f,
        imageError: "Price must be a valid positive number.",
      }));
      return;
    }

    setSavingAddon(true);
    setAddonForm((f) => ({ ...f, imageError: "" }));

    try {
      // ── Upload image if provided ────────────────────────────────────────────
      let imagePath = editingAddon?.image_path || null;

      if (addonForm.imageFile) {
        const bucketName = "feastrush-menu";
        const ext = addonForm.imageFile.name.split(".").pop().toLowerCase();
        const folderPath = `${restId}/add_ons`;
        const filePath = `${folderPath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Ensure folder exists by checking a dummy list (storage auto-creates folders on upload)
        const { error: uploadErr } = await supabase.storage
          .from(bucketName)
          .upload(filePath, addonForm.imageFile, { upsert: false });

        if (uploadErr) {
          throw new Error("Image upload failed: " + uploadErr.message);
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        imagePath = urlData?.publicUrl || null;
      }

      const payload = {
        name: addonForm.name.trim(),
        price: p,
        type_id: addonForm.typeId || null,
        image_path: imagePath,
      };

      if (editingAddon) {
        if (!addonForm.imageFile) {
          // Keep existing image, don't overwrite
          delete payload.image_path;
        }
        const { error } = await supabase
          .from("Add_Ons")
          .update(payload)
          .eq("id", editingAddon.id);
        if (error) throw error;
        setAddonItems((prev) =>
          prev.map((a) =>
            a.id === editingAddon.id
              ? {
                  ...a,
                  name: payload.name,
                  price: payload.price,
                  type_id: payload.type_id,
                  image_path: addonForm.imageFile ? imagePath : a.image_path,
                }
              : a,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("Add_Ons")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setAddonItems((prev) => [...prev, data]);
      }

      setShowAddonModal(false);
    } catch (err) {
      console.error("[saveAddon] error:", err);
      setAddonForm((f) => ({
        ...f,
        imageError: err.message || "Something went wrong.",
      }));
    } finally {
      setSavingAddon(false);
    }
  };

  const executeDeleteAddonItem = async () => {
    if (!confirmDeleteAddon || confirmDeleteAddon.kind !== "item") return;
    const { id } = confirmDeleteAddon;
    setConfirmDeleteAddon(null);
    try {
      const { error } = await supabase.from("Add_Ons").delete().eq("id", id);
      if (error) throw error;
      setAddonItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("[deleteAddonItem] error:", err);
      alert("Failed to delete add-on: " + (err.message || "Unknown error"));
    }
  };

  // ── Add category → INSERT DB ───────────────────────────────────────────────
  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const sortOrder = categories.length + 1;
    try {
      const { data, error } = await supabase
        .from("Categories")
        .insert({
          rest_id: restId,
          name: newCatName.trim(),
          sort_order: sortOrder,
          visible: true,
        })
        .select()
        .single();
      if (error) throw error;
      const cat = { ...data, enabled: true, items: [] };
      setCategories((p) => [...p, cat]);
      setSelectedCatId(cat.id);
      setNewCatName("");
      setShowAddCat(false);
      setMobilePanel("items");
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  // addonTypes and addonItems are fetched from DB (see fetchAddons above)

  const CategoryList = () => (
    <div className="flex flex-col gap-0.5">
      {categories.map((cat, i) => (
        <div
          key={cat.id}
          ref={(el) => {
            catTouchDrag.itemRefs.current[cat.id] = el;
          }}
          onDragEnter={() => {
            overCat.current = i;
          }}
          onDragEnd={onCatDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            setSelectedCatId(cat.id);
            setMobilePanel("items");
          }}
          style={{
            background: selectedCatId === cat.id ? t.accentBg : "transparent",
            borderLeft: `3px solid ${selectedCatId === cat.id ? t.accent : "transparent"}`,
            color: selectedCatId === cat.id ? t.accent : t.subtle,
            userSelect: "none",
            cursor: "pointer",
          }}
          className="flex items-center gap-2 px-3 py-3 rounded-lg transition-colors duration-150"
        >
          {/* Desktop: drag handle | Mobile: arrow buttons */}
          {isTouch ? (
            <div className="flex flex-col gap-0.5 flex-shrink-0 -ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveCat(i, -1);
                }}
                disabled={i === 0}
                style={{
                  color: i === 0 ? t.muted : t.subtle,
                  opacity: i === 0 ? 0.3 : 1,
                  lineHeight: 1,
                }}
                className="text-xs px-1 rounded active:scale-90 transition-transform"
              >
                ▲
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveCat(i, 1);
                }}
                disabled={i === categories.length - 1}
                style={{
                  color: i === categories.length - 1 ? t.muted : t.subtle,
                  opacity: i === categories.length - 1 ? 0.3 : 1,
                  lineHeight: 1,
                }}
                className="text-xs px-1 rounded active:scale-90 transition-transform"
              >
                ▼
              </button>
            </div>
          ) : (
            <span
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                dragCat.current = i;
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                catTouchDrag.onPointerDown(cat.id, e);
              }}
              style={{ color: t.muted, touchAction: "none", cursor: "grab" }}
              className="text-sm flex-shrink-0 select-none px-1 py-1 -ml-1 rounded hover:opacity-60"
            >
              ⠿
            </span>
          )}
          <span
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="text-sm font-semibold flex-1 truncate"
          >
            {cat.name}
          </span>
          <span
            style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
            className="text-xs"
          >
            {cat.items.length}
          </span>
          {!cat.visible && (
            <span style={{ color: t.muted }} className="text-xs">
              ●
            </span>
          )}
          <span style={{ color: t.muted }} className="text-xs md:hidden">
            ›
          </span>
        </div>
      ))}
      {/* Save Order button — appears after drag reorder */}
      {orderDirty && (
        <button
          onClick={saveCategoryOrder}
          disabled={savingOrder}
          style={{
            background: t.accent,
            color: "#fff",
            fontFamily: "'Lato', sans-serif",
            opacity: savingOrder ? 0.7 : 1,
          }}
          className="mt-3 w-full py-2 rounded-lg text-xs font-semibold tracking-wider hover:opacity-90 active:scale-95 transition-all"
        >
          {savingOrder ? "Saving…" : "💾 Save Order"}
        </button>
      )}
    </div>
  );

  const ItemsPanel = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {selectedCat && (
        <div
          style={{ borderBottom: `1px solid ${t.border}` }}
          className="flex items-center justify-between pb-4 mb-4 gap-3"
        >
          {/* Category name — static or inline edit */}
          {editingCatId === selectedCat.id ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                autoFocus
                value={editingCatName}
                onChange={(e) => setEditingCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") renameCat();
                  if (e.key === "Escape") setEditingCatId(null);
                }}
                style={{
                  background: t.surface2,
                  border: `1px solid ${t.accent}`,
                  color: t.text,
                  fontFamily: "'Cormorant Garamond', serif",
                }}
                className="text-xl font-bold rounded-lg px-3 py-1 outline-none flex-1 min-w-0"
              />
              <button
                onClick={renameCat}
                disabled={savingCatName}
                style={{
                  background: t.accent,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                {savingCatName ? "…" : "Save"}
              </button>
              <button
                onClick={() => setEditingCatId(null)}
                style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                className="text-xs px-2 py-1.5 rounded-lg flex-shrink-0 hover:opacity-60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: t.text,
              }}
              className="text-xl font-bold truncate flex-1 min-w-0"
            >
              {selectedCat.name}
            </p>
          )}
          {/* Action buttons — only shown when not in rename mode */}
          {editingCatId !== selectedCat.id && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setEditingCatId(selectedCat.id);
                  setEditingCatName(selectedCat.name);
                }}
                style={{ color: t.subtle }}
                className="text-sm hover:opacity-60 transition-opacity p-1"
                title="Rename category"
              >
                ✏️
              </button>
              <button
                onClick={() => confirmDeleteCat(selectedCat.id)}
                style={{ color: t.subtle }}
                className="text-sm hover:text-red-500 transition-colors p-1"
                title="Delete category"
              >
                🗑️
              </button>
              <Toggle
                value={selectedCat.visible}
                onChange={() => toggleCat(selectedCat.id)}
                t={t}
              />
            </div>
          )}
        </div>
      )}
      {catItems.length === 0 && (
        <div
          style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
          className="text-sm italic py-6 text-center"
        >
          No items yet. Tap "+ Add Item" to get started.
        </div>
      )}
      {catItems.map((item, itemIdx) => (
        <div
          key={item.id}
          ref={(el) => {
            itemTouchDrag.itemRefs.current[item.id] = el;
          }}
          onDragEnter={() => {
            overItem.current = item.id;
          }}
          onDragEnd={() => onItemDrop(selectedCatId)}
          onDragOver={(e) => e.preventDefault()}
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            userSelect: "none",
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-3 mb-2.5 transition-colors hover:shadow-sm"
        >
          {/* Desktop: drag handle | Mobile: arrow buttons */}
          {isTouch ? (
            <div className="flex flex-col gap-0.5 flex-shrink-0 -ml-1">
              <button
                onClick={() => moveItem(itemIdx, -1)}
                disabled={itemIdx === 0}
                style={{
                  color: itemIdx === 0 ? t.muted : t.subtle,
                  opacity: itemIdx === 0 ? 0.3 : 1,
                  lineHeight: 1,
                }}
                className="text-xs px-1 rounded active:scale-90 transition-transform"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(itemIdx, 1)}
                disabled={itemIdx === catItems.length - 1}
                style={{
                  color: itemIdx === catItems.length - 1 ? t.muted : t.subtle,
                  opacity: itemIdx === catItems.length - 1 ? 0.3 : 1,
                  lineHeight: 1,
                }}
                className="text-xs px-1 rounded active:scale-90 transition-transform"
              >
                ▼
              </button>
            </div>
          ) : (
            <span
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                dragItem.current = item.id;
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                itemTouchDrag.onPointerDown(item.id, e);
              }}
              style={{ color: t.muted, touchAction: "none", cursor: "grab" }}
              className="text-xs select-none flex-shrink-0 px-1 py-2 -ml-1 rounded hover:opacity-60"
            >
              ⠿
            </span>
          )}
          <div
            style={{ background: t.surface2, border: `1px solid ${t.border}` }}
            className="w-11 h-11 rounded-lg flex-shrink-0 select-none overflow-hidden"
          >
            <img
              src={
                item.image_path && item.image_path.trim() !== ""
                  ? item.image_path
                  : "/foodlogo.jpg"
              }
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "/foodlogo.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                className="text-sm font-semibold"
              >
                {item.name}
              </p>
              <span
                onClick={() => toggleItemStock(selectedCatId, item.id)}
                style={{
                  background: item.is_available ? t.greenBg : "#FEF2F2",
                  color: item.is_available ? t.green : t.red,
                  border: `1px solid ${item.is_available ? t.greenBorder : "#FECACA"}`,
                }}
                className="text-xs px-2 py-0.5 rounded-full cursor-pointer select-none flex-shrink-0 font-semibold"
              >
                {item.is_available ? "In Stock" : "Out of Stock"}
              </span>
              {item.is_customizable && (
                <span
                  style={{
                    background: t.accentBg,
                    color: t.accent,
                    border: `1px solid ${t.accentBorder}`,
                  }}
                  className="text-xs px-2 py-0.5 rounded-full select-none flex-shrink-0 font-semibold"
                >
                  ⚙️ Customizable
                </span>
              )}
            </div>
            <p
              style={{ color: t.accent, fontFamily: "'Lato', sans-serif" }}
              className="text-sm font-bold mt-0.5"
            >
              KD {Number(item.price).toFixed(3)}
            </p>
            {item.avail_from && item.avail_to && (
              <p
                style={{
                  color:
                    getWindowStatus(item.avail_from, item.avail_to) ===
                    "in-window"
                      ? t.green
                      : t.muted,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="text-xs mt-0.5"
              >
                🕐 {item.avail_from.slice(0, 5)} – {item.avail_to.slice(0, 5)}{" "}
                KWT
                {getWindowStatus(item.avail_from, item.avail_to) ===
                  "out-window" && " · Outside window"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Popular star toggle */}
            <button
              onClick={() => toggleItemPopular(selectedCatId, item.id)}
              style={{ color: item.is_popular ? "#F59E0B" : t.muted }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity text-base"
              title={item.is_popular ? "Unmark as popular" : "Mark as popular"}
            >
              {item.is_popular ? "★" : "☆"}
            </button>
            <button
              onClick={() => openVariants(item)}
              style={{
                color: item.is_customizable ? t.accent : t.subtle,
                background: item.is_customizable ? t.accentBg : "transparent",
                border: `1px solid ${item.is_customizable ? t.accentBorder : "transparent"}`,
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-60 transition-opacity text-sm"
              title="Manage Variants"
            >
              ⚙️
            </button>
            <button
              onClick={() => openEditItem(item)}
              style={{ color: t.subtle }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-60 transition-opacity text-sm"
            >
              ✏️
            </button>
            <button
              onClick={() => confirmDeleteItem(selectedCatId, item.id)}
              style={{ color: t.subtle }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-red-500 transition-colors text-sm"
            >
              🗑️
            </button>
            {/* visible toggle → Categories.visible in DB */}
            <Toggle
              value={item.visible}
              onChange={() => toggleItem(selectedCatId, item.id)}
              t={t}
            />
          </div>
        </div>
      ))}
      {/* Save Item Order button — appears after arrow reorder */}
      {itemOrderDirty && (
        <button
          onClick={saveItemOrder}
          disabled={savingItemOrder}
          style={{
            background: t.accent,
            color: "#fff",
            fontFamily: "'Lato', sans-serif",
            opacity: savingItemOrder ? 0.7 : 1,
          }}
          className="mt-1 mb-2 w-full py-2 rounded-lg text-xs font-semibold tracking-wider hover:opacity-90 active:scale-95 transition-all"
        >
          {savingItemOrder ? "Saving…" : "💾 Save Item Order"}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Loading / error overlay */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p
            style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
            className="text-sm"
          >
            Loading menu…
          </p>
        </div>
      )}
      {!loading && loadError && (
        <div className="flex-1 flex items-center justify-center">
          <p
            style={{ color: t.red, fontFamily: "'Lato', sans-serif" }}
            className="text-sm text-center px-6"
          >
            {loadError}
          </p>
        </div>
      )}
      {!loading && !loadError && (
        <>
          <div
            style={{ borderBottom: `1px solid ${t.border}` }}
            className="px-5 md:px-8 pt-5 pb-0 flex-shrink-0"
          >
            <div className="md:hidden flex items-center gap-3 mb-3">
              {(mobilePanel === "items" || mobilePanel === "addons") && (
                <button
                  onClick={() => setMobilePanel("categories")}
                  style={{
                    background: t.accentBg,
                    border: `1px solid ${t.accentBorder}`,
                    color: t.accent,
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold"
                >
                  ← Back
                </button>
              )}
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: t.text,
                }}
                className="text-2xl font-bold"
              >
                {mobilePanel === "categories"
                  ? "Menu"
                  : mobilePanel === "items"
                    ? selectedCat?.name
                    : "Add-Ons"}
              </h1>
            </div>
            <div className="hidden md:flex items-center justify-between mb-4 flex-wrap gap-3">
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: t.text,
                }}
                className="text-3xl md:text-4xl font-bold tracking-tight"
              >
                Menu
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  ["Download CSV 📥", null],
                  ["Upload CSV 📤", null],
                ].map(([label]) => (
                  <button
                    key={label}
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.subtle,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-medium px-4 py-2.5 rounded-lg tracking-wide hover:opacity-80 transition-all active:scale-95"
                  >
                    {label}
                  </button>
                ))}

                <button
                  onClick={section === "menu" ? openAddItem : openAddAddon}
                  style={{
                    background: t.accent,
                    color: "#fff",
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="text-xs font-semibold px-4 py-2.5 rounded-lg tracking-wide hover:opacity-90 transition-all active:scale-95"
                >
                  + {section === "menu" ? "Add Item" : "Add Add-On"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-5">
                {[
                  ["menu", "Menu Items"],
                  ["addons", "Add-Ons"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSection(id);
                      setMobilePanel(id === "addons" ? "addons" : "categories");
                    }}
                    style={{
                      color: section === id ? t.accent : t.subtle,
                      borderBottomColor:
                        section === id ? t.accent : "transparent",
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="pb-3 text-sm font-semibold tracking-wide border-b-2 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="md:hidden flex items-center gap-2 pb-3">
                {section === "menu" && mobilePanel === "categories" && (
                  <button
                    onClick={() => setShowAddCat(true)}
                    style={{
                      background: t.accentBg,
                      border: `1px solid ${t.accentBorder}`,
                      color: t.accent,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    + Category
                  </button>
                )}
                {section === "menu" && mobilePanel === "items" && (
                  <>
                    <button
                      onClick={openAddItem}
                      style={{
                        background: t.accent,
                        color: "#fff",
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      + Add Item
                    </button>
                  </>
                )}
                {section === "addons" && (
                  <button
                    onClick={openAddAddon}
                    style={{
                      background: t.accent,
                      color: "#fff",
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    + Add-On
                  </button>
                )}
              </div>
            </div>
          </div>

          {section === "menu" ? (
            <>
              <div className="hidden md:flex flex-1 overflow-hidden">
                <div
                  style={{
                    background: t.surface,
                    borderRight: `1px solid ${t.border}`,
                    width: 220,
                    minWidth: 180,
                  }}
                  className="flex-shrink-0 flex flex-col overflow-hidden"
                >
                  <div
                    style={{ borderBottom: `1px solid ${t.border}` }}
                    className="px-4 pt-4 pb-3 flex items-center justify-between"
                  >
                    <p
                      style={{
                        color: t.subtle,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs font-bold tracking-widest uppercase"
                    >
                      Categories
                    </p>
                    <button
                      onClick={() => setShowAddCat(true)}
                      style={{
                        color: t.accent,
                        background: t.accentBg,
                        border: `1px solid ${t.accentBorder}`,
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    <CategoryList />
                  </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ItemsPanel />
                </div>
              </div>

              <div className="md:hidden flex-1 overflow-hidden relative">
                <div
                  className={`absolute inset-0 overflow-y-auto transition-transform duration-300 ${mobilePanel === "categories" ? "translate-x-0" : "-translate-x-full"}`}
                  style={{ background: t.bg }}
                >
                  <div className="p-4">
                    <CategoryList />
                    <button
                      onClick={() => setShowAddCat(true)}
                      style={{
                        background: t.accentBg,
                        border: `1px solid ${t.accentBorder}`,
                        color: t.accent,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="w-full mt-3 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-center"
                    >
                      + New Category
                    </button>
                  </div>
                </div>
                <div
                  className={`absolute inset-0 flex flex-col overflow-hidden transition-transform duration-300 ${mobilePanel === "items" ? "translate-x-0" : "translate-x-full"}`}
                  style={{ background: t.bg }}
                >
                  <ItemsPanel />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {/* ── Top action bar ── */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={openAddType}
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.subtle,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold px-4 py-2.5 rounded-lg tracking-wide hover:opacity-80 transition-all active:scale-95"
                  >
                    + New Type
                  </button>
                  <button
                    onClick={() => openAddAddonItem(null)}
                    style={{
                      background: t.accent,
                      color: "#fff",
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold px-4 py-2.5 rounded-lg tracking-wide hover:opacity-90 transition-all active:scale-95"
                  >
                    + Add Add-On
                  </button>
                </div>
              </div>

              {loadingAddons ? (
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm"
                >
                  Loading add-ons…
                </p>
              ) : (
                <>
                  {/* ── Typed sections ── */}
                  {addonTypes.map((type) => {
                    const items = addonItems.filter(
                      (a) => a.type_id === type.id,
                    );
                    return (
                      <div key={type.id} className="mb-8">
                        <div
                          style={{ borderBottom: `1px solid ${t.border}` }}
                          className="flex items-center justify-between pb-3 mb-3 flex-wrap gap-2"
                        >
                          <div>
                            <p
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: t.text,
                              }}
                              className="text-xl font-bold"
                            >
                              {type.name}
                            </p>
                            {type.min_qty > 0 && (
                              <p
                                style={{
                                  color: t.muted,
                                  fontFamily: "'Lato', sans-serif",
                                }}
                                className="text-xs mt-0.5"
                              >
                                Min. required: {type.min_qty}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openAddAddonItem(type.id)}
                              style={{
                                background: t.accentBg,
                                border: `1px solid ${t.accentBorder}`,
                                color: t.accent,
                                fontFamily: "'Lato', sans-serif",
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                            >
                              + Add Item
                            </button>
                            <button
                              onClick={() => openEditType(type)}
                              style={{ color: t.subtle }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-60 transition-opacity text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDeleteAddon({
                                  kind: "type",
                                  id: type.id,
                                  name: type.name,
                                })
                              }
                              style={{ color: t.subtle }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:text-red-500 transition-colors text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        {items.length === 0 ? (
                          <p
                            style={{
                              color: t.muted,
                              fontFamily: "'Lato', sans-serif",
                            }}
                            className="text-sm italic"
                          >
                            No items in this type yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {items.map((addon) => (
                              <AddonItemRow
                                key={addon.id}
                                addon={addon}
                                t={t}
                                onEdit={() => openEditAddonItem(addon)}
                                onDelete={() =>
                                  setConfirmDeleteAddon({
                                    kind: "item",
                                    id: addon.id,
                                    name: addon.name,
                                  })
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ── Uncategorized section ── */}
                  {(() => {
                    const uncat = addonItems.filter((a) => !a.type_id);
                    if (uncat.length === 0 && addonTypes.length > 0)
                      return null;
                    return (
                      <div className="mb-8">
                        <div
                          style={{ borderBottom: `1px solid ${t.border}` }}
                          className="flex items-center justify-between pb-3 mb-3 flex-wrap gap-2"
                        >
                          <p
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: t.text,
                            }}
                            className="text-xl font-bold"
                          >
                            Uncategorized
                          </p>
                          <button
                            onClick={() => openAddAddonItem(null)}
                            style={{
                              background: t.accentBg,
                              border: `1px solid ${t.accentBorder}`,
                              color: t.accent,
                              fontFamily: "'Lato', sans-serif",
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          >
                            + Add Item
                          </button>
                        </div>
                        {uncat.length === 0 ? (
                          <p
                            style={{
                              color: t.muted,
                              fontFamily: "'Lato', sans-serif",
                            }}
                            className="text-sm italic"
                          >
                            No add-ons yet. Click "+ Add Add-On" or "+ New Type"
                            to get started.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {uncat.map((addon) => (
                              <AddonItemRow
                                key={addon.id}
                                addon={addon}
                                t={t}
                                onEdit={() => openEditAddonItem(addon)}
                                onDelete={() =>
                                  setConfirmDeleteAddon({
                                    kind: "item",
                                    id: addon.id,
                                    name: addon.name,
                                  })
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {showAddCat && (
            <Modal
              title="New Category"
              onClose={() => setShowAddCat(false)}
              t={t}
            >
              <Field
                label="Category Name"
                value={newCatName}
                onChange={setNewCatName}
                placeholder="e.g. Wraps"
                t={t}
              />
              <button
                onClick={addCategory}
                style={{
                  background: t.accent,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                Create Category
              </button>
            </Modal>
          )}
          {showItemModal && (
            <Modal
              title={editingItem ? "Edit Item" : "Add Item"}
              onClose={() => {
                setShowItemModal(false);
              }}
              t={t}
            >
              {/* ── Error banner — shown at top so it's never missed ── */}
              {itemForm.imageError && (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2"
                >
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <p
                    style={{ color: "#B83232" }}
                    className="text-sm leading-snug"
                  >
                    {itemForm.imageError}
                  </p>
                </div>
              )}

              {/* ── Image Upload ── */}
              <div className="mb-5">
                <label
                  style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs font-bold tracking-widest uppercase block mb-2"
                >
                  Item Image{" "}
                  <span
                    style={{ color: t.muted }}
                    className="normal-case font-normal"
                  >
                    (optional)
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="item-image-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      setItemForm((f) => ({
                        ...f,
                        imageError: "Image must be under 5 MB.",
                      }));
                      return;
                    }
                    const preview = URL.createObjectURL(file);
                    setItemForm((f) => ({
                      ...f,
                      imageFile: file,
                      imagePreview: preview,
                      imageError: "",
                    }));
                  }}
                />
                <label
                  htmlFor="item-image-upload"
                  className="flex flex-col items-center justify-center rounded-xl overflow-hidden transition-all hover:opacity-80 active:scale-[0.98]"
                  style={{
                    background: t.surface2,
                    border: `2px dashed ${itemForm.imagePreview ? t.accent : t.border2}`,
                    cursor: "pointer",
                    minHeight: 140,
                  }}
                >
                  {itemForm.imagePreview ? (
                    <img
                      src={itemForm.imagePreview}
                      alt="Preview"
                      className="w-full object-cover"
                      style={{ maxHeight: 180 }}
                      onError={(e) => {
                        e.currentTarget.src = "/foodlogo.jpg";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
                      <span className="text-3xl">🖼️</span>
                      <p
                        style={{
                          color: t.subtle,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-sm font-medium"
                      >
                        Tap to upload image
                      </p>
                      <p
                        style={{
                          color: t.muted,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs"
                      >
                        PNG, JPG, WEBP · max 5 MB
                      </p>
                    </div>
                  )}
                </label>
                {itemForm.imagePreview && (
                  <button
                    onClick={() =>
                      setItemForm((f) => ({
                        ...f,
                        imageFile: null,
                        imagePreview: null,
                      }))
                    }
                    style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                    className="text-xs mt-2 hover:opacity-60 transition-opacity"
                  >
                    ✕ Remove image
                  </button>
                )}
              </div>

              {/* ── Item Name ── */}
              <Field
                label="Item Name"
                value={itemForm.name}
                onChange={(v) => setItemForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Chicken Wrap"
                t={t}
              />

              {/* ── Description (optional) ── */}
              <div className="mb-5">
                <label
                  style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs font-semibold tracking-widest uppercase block mb-2"
                >
                  Description{" "}
                  <span
                    style={{ color: t.muted }}
                    className="normal-case font-normal"
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="A short description of the item…"
                  rows={2}
                  style={{
                    background: t.surface2,
                    border: `1px solid ${t.border2}`,
                    color: t.text,
                    fontFamily: "'Lato', sans-serif",
                    resize: "none",
                  }}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
                />
              </div>

              {/* ── Price ── */}
              <Field
                label="Price (KD)"
                value={itemForm.price}
                onChange={(v) => setItemForm((f) => ({ ...f, price: v }))}
                type="number"
                placeholder="0.000"
                t={t}
              />

              {/* ── Availability Window ── */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label
                    style={{
                      color: t.subtle,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="text-xs font-semibold tracking-widest uppercase"
                  >
                    Availability Window{" "}
                    <span
                      style={{ color: t.muted }}
                      className="normal-case font-normal"
                    >
                      (Kuwait time · optional)
                    </span>
                  </label>
                  {(itemForm.avail_from || itemForm.avail_to) && (
                    <button
                      onClick={() =>
                        setItemForm((f) => ({
                          ...f,
                          avail_from: "",
                          avail_to: "",
                        }))
                      }
                      style={{
                        color: t.muted,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs hover:opacity-60 transition-opacity"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "avail_from", label: "From" },
                    { key: "avail_to", label: "To" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <p
                        style={{
                          color: t.muted,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs mb-1.5"
                      >
                        {label}
                      </p>
                      {/* Custom styled time picker — scrollable hour/minute columns */}
                      {(() => {
                        const val = itemForm[key] || "";
                        const [hh, mm] = val ? val.split(":") : ["", ""];
                        const curH = hh !== "" ? parseInt(hh) : null;
                        const curM = mm !== "" ? parseInt(mm) : null;
                        const setTime = (h, m) => {
                          if (h === null || m === null) {
                            setItemForm((f) => ({ ...f, [key]: "" }));
                          } else {
                            setItemForm((f) => ({
                              ...f,
                              [key]: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                            }));
                          }
                        };
                        return (
                          <div
                            style={{
                              background: t.surface2,
                              border: `1px solid ${val ? t.accent : t.border2}`,
                              borderRadius: 12,
                              overflow: "hidden",
                            }}
                          >
                            {/* Display row */}
                            <div
                              style={{
                                borderBottom: `1px solid ${t.border}`,
                                background: val ? t.accentBg : "transparent",
                              }}
                              className="flex items-center justify-center gap-1 py-2.5"
                            >
                              <span
                                style={{
                                  color: val ? t.accent : t.muted,
                                  fontFamily: "'Lato', sans-serif",
                                }}
                                className="text-lg font-bold tabular-nums"
                              >
                                {val
                                  ? `${String(curH).padStart(2, "0")}:${String(curM).padStart(2, "0")}`
                                  : "--:--"}
                              </span>
                            </div>
                            {/* Hour scroll */}
                            <div className="flex" style={{ height: 120 }}>
                              <div
                                className="flex-1 overflow-y-auto"
                                style={{ scrollbarWidth: "none" }}
                              >
                                {Array.from({ length: 24 }, (_, h) => (
                                  <button
                                    key={h}
                                    onClick={() => setTime(h, curM ?? 0)}
                                    style={{
                                      background:
                                        curH === h ? t.accent : "transparent",
                                      color: curH === h ? "#fff" : t.subtle,
                                      fontFamily: "'Lato', sans-serif",
                                      width: "100%",
                                      display: "block",
                                      padding: "5px 0",
                                      fontSize: 13,
                                      fontWeight: curH === h ? 700 : 400,
                                      borderBottom: `1px solid ${t.border}`,
                                    }}
                                  >
                                    {String(h).padStart(2, "0")}
                                  </button>
                                ))}
                              </div>
                              <div style={{ width: 1, background: t.border }} />
                              {/* Minute scroll — 5-min steps */}
                              <div
                                className="flex-1 overflow-y-auto"
                                style={{ scrollbarWidth: "none" }}
                              >
                                {Array.from(
                                  { length: 12 },
                                  (_, i) => i * 5,
                                ).map((m) => (
                                  <button
                                    key={m}
                                    onClick={() => setTime(curH ?? 0, m)}
                                    style={{
                                      background:
                                        curM === m ? t.accent : "transparent",
                                      color: curM === m ? "#fff" : t.subtle,
                                      fontFamily: "'Lato', sans-serif",
                                      width: "100%",
                                      display: "block",
                                      padding: "5px 0",
                                      fontSize: 13,
                                      fontWeight: curM === m ? 700 : 400,
                                      borderBottom: `1px solid ${t.border}`,
                                    }}
                                  >
                                    :{String(m).padStart(2, "0")}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
                {itemForm.avail_from && itemForm.avail_to && (
                  <p
                    style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                    className="text-xs mt-2"
                  >
                    Item available {itemForm.avail_from} → {itemForm.avail_to}{" "}
                    KWT daily.
                    {itemForm.avail_to <= itemForm.avail_from
                      ? " (overnight span)"
                      : ""}
                  </p>
                )}
                {(itemForm.avail_from || itemForm.avail_to) &&
                  !(itemForm.avail_from && itemForm.avail_to) && (
                    <p
                      style={{
                        color: "#B45309",
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs mt-2"
                    >
                      ⚠️ Set both From and To to enable the time window.
                    </p>
                  )}
              </div>

              {/* ── Submit ── */}
              <button
                onClick={saveItem}
                disabled={savingItem}
                style={{
                  background: t.accent,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                  opacity: savingItem ? 0.7 : 1,
                }}
                className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                {savingItem
                  ? "Saving…"
                  : editingItem
                    ? "Save Changes"
                    : "Add Item"}
              </button>
            </Modal>
          )}

          {/* ── Variant Groups Modal ──────────────────────────────────────── */}
          {variantItem && (
            <div
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) closeVariants();
              }}
            >
              <div
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              >
                {/* Header */}
                <div
                  style={{ borderBottom: `1px solid ${t.border}` }}
                  className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p
                      style={{
                        color: t.text,
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                      className="text-xl font-bold tracking-wide truncate"
                    >
                      Variants — {variantItem.name}
                    </p>
                    <p
                      style={{
                        color: t.muted,
                        fontFamily: "'Lato', sans-serif",
                      }}
                      className="text-xs mt-0.5"
                    >
                      Add groups (e.g. Size, Spice Level) and their options
                    </p>
                  </div>
                  <button
                    onClick={closeVariants}
                    style={{ color: t.subtle }}
                    className="text-lg leading-none hover:opacity-60 transition-opacity w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {loadingVariants ? (
                    <p
                      style={{ color: t.muted }}
                      className="text-sm text-center py-6"
                    >
                      Loading variants…
                    </p>
                  ) : (
                    <>
                      {variantGroups.length === 0 && (
                        <div
                          style={{
                            border: `2px dashed ${t.border2}`,
                            color: t.muted,
                          }}
                          className="rounded-xl p-6 text-center text-sm italic"
                        >
                          No variant groups yet. Add one below to make this item
                          customizable.
                        </div>
                      )}

                      {variantGroups.map((group, gIdx) => (
                        <div
                          key={group.id || group._localId}
                          style={{
                            background: t.surface2,
                            border: `1px solid ${t.border}`,
                          }}
                          className="rounded-xl p-4"
                        >
                          {/* Group header row */}
                          <div className="flex items-start gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <input
                                value={group.name}
                                onChange={(e) =>
                                  updateVariantGroup(
                                    gIdx,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder="Group name (e.g. Size, Spice Level)"
                                style={{
                                  background: t.surface,
                                  border: `1px solid ${t.border2}`,
                                  color: t.text,
                                  fontFamily: "'Lato', sans-serif",
                                }}
                                className="w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none"
                              />
                            </div>
                            <button
                              onClick={() => removeVariantGroup(gIdx)}
                              style={{ color: t.muted }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-red-500 transition-colors flex-shrink-0 mt-0.5 text-sm"
                            >
                              🗑️
                            </button>
                          </div>

                          {/* Toggles */}
                          <div className="flex items-center gap-4 mb-3">
                            <button
                              onClick={() =>
                                updateVariantGroup(
                                  gIdx,
                                  "is_required",
                                  !group.is_required,
                                )
                              }
                              style={{
                                background: group.is_required
                                  ? t.accentBg
                                  : t.surface,
                                border: `1px solid ${group.is_required ? t.accentBorder : t.border2}`,
                                color: group.is_required ? t.accent : t.subtle,
                                fontFamily: "'Lato', sans-serif",
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                            >
                              <span>{group.is_required ? "✓" : "○"}</span>{" "}
                              Required
                            </button>
                            <button
                              onClick={() =>
                                updateVariantGroup(
                                  gIdx,
                                  "is_multiple",
                                  !group.is_multiple,
                                )
                              }
                              style={{
                                background: group.is_multiple
                                  ? t.accentBg
                                  : t.surface,
                                border: `1px solid ${group.is_multiple ? t.accentBorder : t.border2}`,
                                color: group.is_multiple ? t.accent : t.subtle,
                                fontFamily: "'Lato', sans-serif",
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                            >
                              <span>{group.is_multiple ? "✓" : "○"}</span>{" "}
                              Multi-select
                            </button>
                          </div>

                          {/* Options */}
                          <div className="space-y-2 mb-2">
                            {group.options.map((opt, oIdx) => (
                              <div
                                key={opt.id || opt._localId}
                                className="flex items-center gap-2"
                              >
                                <input
                                  value={opt.name}
                                  onChange={(e) =>
                                    updateVariantOption(
                                      gIdx,
                                      oIdx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Option name (e.g. Large, Extra Spicy)"
                                  style={{
                                    background: t.surface,
                                    border: `1px solid ${t.border2}`,
                                    color: t.text,
                                    fontFamily: "'Lato', sans-serif",
                                  }}
                                  className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm outline-none"
                                />
                                <div
                                  className="flex items-center flex-shrink-0"
                                  style={{ width: 100 }}
                                >
                                  <span
                                    style={{
                                      color: t.muted,
                                      fontFamily: "'Lato', sans-serif",
                                    }}
                                    className="text-xs mr-1 flex-shrink-0"
                                  >
                                    KD
                                  </span>
                                  <input
                                    type="number"
                                    value={opt.price_adj}
                                    onChange={(e) =>
                                      updateVariantOption(
                                        gIdx,
                                        oIdx,
                                        "price_adj",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="0.000"
                                    step="0.001"
                                    style={{
                                      background: t.surface,
                                      border: `1px solid ${t.border2}`,
                                      color: t.text,
                                      fontFamily: "'Lato', sans-serif",
                                    }}
                                    className="w-full rounded-lg px-2 py-2 text-sm outline-none"
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    removeVariantOption(gIdx, oIdx)
                                  }
                                  style={{ color: t.muted }}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:text-red-500 transition-colors flex-shrink-0 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => addVariantOption(gIdx)}
                            style={{
                              color: t.accent,
                              background: t.accentBg,
                              border: `1px solid ${t.accentBorder}`,
                              fontFamily: "'Lato', sans-serif",
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity mt-1"
                          >
                            + Add Option
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addVariantGroup}
                        style={{
                          background: t.surface2,
                          border: `2px dashed ${t.border2}`,
                          color: t.subtle,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="w-full py-3 rounded-xl text-xs font-semibold tracking-wider hover:opacity-80 transition-opacity"
                      >
                        + Add Variant Group
                      </button>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{ borderTop: `1px solid ${t.border}` }}
                  className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
                >
                  <button
                    onClick={closeVariants}
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.subtle,
                      fontFamily: "'Lato', sans-serif",
                    }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveVariants}
                    disabled={savingVariants || loadingVariants}
                    style={{
                      background: t.accent,
                      color: "#fff",
                      fontFamily: "'Lato', sans-serif",
                      opacity: savingVariants || loadingVariants ? 0.7 : 1,
                    }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                  >
                    {savingVariants ? "Saving…" : "Save Variants"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Add-On Type Modal ─────────────────────────────────────────── */}
          {showAddonTypeModal && (
            <Modal
              title={editingAddonType ? "Edit Add-On Type" : "New Add-On Type"}
              onClose={() => setShowAddonTypeModal(false)}
              t={t}
            >
              <Field
                label="Type Name"
                value={addonTypeForm.name}
                onChange={(v) => setAddonTypeForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Sauces, Toppings, Extras"
                t={t}
              />
              <Field
                label="Minimum Required (optional)"
                value={addonTypeForm.minQty}
                onChange={(v) => setAddonTypeForm((f) => ({ ...f, minQty: v }))}
                type="number"
                placeholder="0"
                t={t}
              />
              <button
                onClick={saveAddonType}
                disabled={savingAddon}
                style={{
                  background: t.accent,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                  opacity: savingAddon ? 0.7 : 1,
                }}
                className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                {savingAddon
                  ? "Saving…"
                  : editingAddonType
                    ? "Save Changes"
                    : "Create Type"}
              </button>
            </Modal>
          )}

          {/* ── Add/Edit Add-On Item Modal ────────────────────────────────── */}
          {showAddonModal && (
            <Modal
              title={editingAddon ? "Edit Add-On" : "Add Add-On"}
              onClose={() => setShowAddonModal(false)}
              t={t}
            >
              {/* Error banner */}
              {addonForm.imageError && (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2"
                >
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <p
                    style={{ color: "#B83232" }}
                    className="text-sm leading-snug"
                  >
                    {addonForm.imageError}
                  </p>
                </div>
              )}

              {/* Image upload */}
              <div className="mb-5">
                <label
                  style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs font-bold tracking-widest uppercase block mb-2"
                >
                  Image{" "}
                  <span
                    style={{ color: t.muted }}
                    className="normal-case font-normal"
                  >
                    (optional)
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="addon-image-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      setAddonForm((f) => ({
                        ...f,
                        imageError: "Image must be under 5 MB.",
                      }));
                      return;
                    }
                    const preview = URL.createObjectURL(file);
                    setAddonForm((f) => ({
                      ...f,
                      imageFile: file,
                      imagePreview: preview,
                      imageError: "",
                    }));
                  }}
                />
                <label
                  htmlFor="addon-image-upload"
                  className="flex flex-col items-center justify-center rounded-xl overflow-hidden transition-all hover:opacity-80 active:scale-[0.98]"
                  style={{
                    background: t.surface2,
                    border: `2px dashed ${addonForm.imagePreview ? t.accent : t.border2}`,
                    cursor: "pointer",
                    minHeight: 120,
                  }}
                >
                  {addonForm.imagePreview ? (
                    <img
                      src={addonForm.imagePreview}
                      alt="Preview"
                      className="w-full object-cover"
                      style={{ maxHeight: 160 }}
                      onError={(e) => {
                        e.currentTarget.src = "/sides.jpg";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
                      <span className="text-3xl">🖼️</span>
                      <p
                        style={{
                          color: t.subtle,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-sm font-medium"
                      >
                        Tap to upload image
                      </p>
                      <p
                        style={{
                          color: t.muted,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs"
                      >
                        PNG, JPG, WEBP · max 5 MB
                      </p>
                    </div>
                  )}
                </label>
                {addonForm.imagePreview && (
                  <button
                    onClick={() =>
                      setAddonForm((f) => ({
                        ...f,
                        imageFile: null,
                        imagePreview: null,
                      }))
                    }
                    style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                    className="text-xs mt-2 hover:opacity-60 transition-opacity"
                  >
                    ✕ Remove image
                  </button>
                )}
              </div>

              {/* Name */}
              <Field
                label="Add-On Name"
                value={addonForm.name}
                onChange={(v) => setAddonForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Ketchup, Mayo, Extra Cheese"
                t={t}
              />

              {/* Price */}
              <Field
                label="Price (KD)"
                value={addonForm.price}
                onChange={(v) => setAddonForm((f) => ({ ...f, price: v }))}
                type="number"
                placeholder="0.000"
                t={t}
              />

              {/* Type selector */}
              <div className="mb-5">
                <label
                  style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs font-bold tracking-widest uppercase block mb-2"
                >
                  Add-On Type{" "}
                  <span
                    style={{ color: t.muted }}
                    className="normal-case font-normal"
                  >
                    (optional — leave empty for Uncategorized)
                  </span>
                </label>
                <select
                  value={addonForm.typeId ?? ""}
                  onChange={(e) =>
                    setAddonForm((f) => ({
                      ...f,
                      typeId: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  style={{
                    background: t.surface2,
                    border: `1px solid ${t.border2}`,
                    color: t.text,
                    fontFamily: "'Lato', sans-serif",
                  }}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                >
                  <option value="">Uncategorized</option>
                  {addonTypes.map((type) => (
                    <option
                      key={type.id}
                      value={type.id}
                      style={{ background: t.surface2 }}
                    >
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={saveAddon}
                disabled={savingAddon}
                style={{
                  background: t.accent,
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                  opacity: savingAddon ? 0.7 : 1,
                }}
                className="w-full py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                {savingAddon
                  ? "Saving…"
                  : editingAddon
                    ? "Save Changes"
                    : "Add Add-On"}
              </button>
            </Modal>
          )}

          {/* ── Confirm Delete Addon ──────────────────────────────────────── */}
          {confirmDeleteAddon && (
            <div
              className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setConfirmDeleteAddon(null);
              }}
            >
              <div
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-6 pt-6 pb-2 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                    }}
                  >
                    🗑️
                  </div>
                  <p
                    style={{
                      color: t.text,
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                    className="text-xl font-bold mb-2"
                  >
                    {confirmDeleteAddon.kind === "type"
                      ? "Delete Add-On Type?"
                      : "Delete Add-On?"}
                  </p>
                  <p
                    style={{ color: t.subtle }}
                    className="text-sm leading-relaxed"
                  >
                    <span style={{ color: t.text }} className="font-semibold">
                      "{confirmDeleteAddon.name}"
                    </span>{" "}
                    will be permanently deleted.
                    {confirmDeleteAddon.kind === "type" &&
                      " All items in this type will become Uncategorized."}{" "}
                    This cannot be undone.
                  </p>
                </div>
                <div className="p-6 flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteAddon(null)}
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.text,
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      confirmDeleteAddon.kind === "type"
                        ? executeDeleteAddonType()
                        : executeDeleteAddonItem()
                    }
                    style={{ background: "#B83232", color: "#fff" }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Confirm Delete Modal ─────────────────────────────────────── */}
          {confirmDelete && (
            <div
              className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setConfirmDelete(null);
              }}
            >
              <div
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-6 pt-6 pb-2 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                    }}
                  >
                    🗑️
                  </div>
                  <p
                    style={{
                      color: t.text,
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                    className="text-xl font-bold mb-2"
                  >
                    {confirmDelete.type === "cat"
                      ? "Delete Category?"
                      : "Delete Item?"}
                  </p>
                  <p
                    style={{ color: t.subtle }}
                    className="text-sm leading-relaxed"
                  >
                    <span style={{ color: t.text }} className="font-semibold">
                      "{confirmDelete.name}"
                    </span>{" "}
                    will be permanently deleted.
                    {confirmDelete.type === "cat" &&
                      " All items in this category will also be removed."}{" "}
                    This cannot be undone.
                  </p>
                </div>
                <div className="p-6 flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.text,
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      confirmDelete.type === "cat"
                        ? executeDeleteCat()
                        : executeDeleteItem()
                    }
                    style={{ background: "#B83232", color: "#fff" }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Time-Limit Override Warning ──────────────────────────────── */}
          {timeBlockedItem && (
            <div
              className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setTimeBlockedItem(null);
              }}
            >
              <div
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  fontFamily: "'Lato', sans-serif",
                }}
                className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-6 pt-6 pb-2 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                    style={{
                      background: "#FFFBEB",
                      border: "1px solid #FCD34D",
                    }}
                  >
                    🕐
                  </div>
                  <p
                    style={{
                      color: t.text,
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                    className="text-xl font-bold mb-2"
                  >
                    Outside Availability Window
                  </p>
                  <p
                    style={{ color: t.subtle }}
                    className="text-sm leading-relaxed mb-1"
                  >
                    <span style={{ color: t.text }} className="font-semibold">
                      "{timeBlockedItem.name}"
                    </span>{" "}
                    is set to be available only between{" "}
                    <span style={{ color: t.accent }} className="font-semibold">
                      {timeBlockedItem.avail_from?.slice(0, 5)} –{" "}
                      {timeBlockedItem.avail_to?.slice(0, 5)} KWT
                    </span>
                    .
                  </p>
                  <p
                    style={{ color: t.subtle }}
                    className="text-sm leading-relaxed"
                  >
                    To mark it In Stock now, first update the time window to
                    include the current time, or clear the time limit entirely.
                  </p>
                </div>
                <div className="p-6 flex gap-3">
                  <button
                    onClick={() => setTimeBlockedItem(null)}
                    style={{
                      background: t.surface2,
                      border: `1px solid ${t.border2}`,
                      color: t.text,
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => {
                      setTimeBlockedItem(null);
                      openEditItem(timeBlockedItem);
                    }}
                    style={{ background: t.accent, color: "#fff" }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                  >
                    ✏️ Edit Time Limit
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── CancellationsPage ────────────────────────────────────────────────────────
function CancellationsPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!restId) { setLoading(false); return; }
    (async () => {
      try {
        const { data, error } = await supabase
          .from("Orders")
          .select(
            `id, status, total_amount, payment_method, payment_status, notes, created_at,
             cust_id, Customer(id, cust_name, ph_num)`
          )
          .eq("rest_id", restId)
          .eq("status", "cancelled")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } catch (e) {
        console.error("[CancellationsPage]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [restId]);

  // Realtime: pick up newly cancelled orders live
  useEffect(() => {
    if (!restId) return;
    const ch = supabase
      .channel(`cancellations-${restId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Orders",
          filter: `rest_id=eq.${restId}`,
        },
        (payload) => {
          if (payload.new?.status === "cancelled") {
            setOrders((prev) => {
              if (prev.find((o) => o.id === payload.new.id)) return prev;
              return [{ ...payload.new }, ...prev];
            });
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [restId]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      (o.Customer?.cust_name || "").toLowerCase().includes(q) ||
      (o.Customer?.ph_num || "").includes(q) ||
      (o.payment_method || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div style={{ padding: "20px 24px 40px" }}>
      <style>{`
        .cancel-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .cancel-table th { padding: 13px 16px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; font-family: 'Lato', sans-serif; }
        .cancel-table td { padding: 13px 16px; font-size: 13px; vertical-align: middle; border-bottom: 1px solid; white-space: nowrap; font-family: 'Lato', sans-serif; }
        .cancel-table tr:last-child td { border-bottom: none; }
        .cancel-table tbody tr:hover td { filter: brightness(0.97); }
        @media(max-width:640px){ .cancel-table th, .cancel-table td { padding: 10px 11px; font-size: 12px; } }
      `}</style>

      {/* Header */}
      <h1
        style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
        className="text-3xl md:text-4xl font-bold tracking-tight mb-1"
      >
        Cancellations
      </h1>
      <p style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 20 }}>
        Orders cancelled by customers before being accepted.
      </p>

      {/* Search */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 0 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4, fontSize: 14 }}>
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search Table...."
            style={{
              width: "100%",
              paddingLeft: 36,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
              borderRadius: 8,
              fontSize: 13,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 13 }}>Loading cancellations…</p>
      ) : (
        <>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: 12, border: `1px solid ${t.border}` }}>
            <table className="cancel-table">
              <thead>
                <tr style={{ background: t.text }}>
                  <th style={{ color: "#fff" }}>Order ID</th>
                  <th style={{ color: "#fff" }}>Order Type</th>
                  <th style={{ color: "#fff" }}>Ordered On</th>
                  <th style={{ color: "#fff" }}>Phone No.</th>
                  <th style={{ color: "#fff" }}>Customer Name</th>
                  <th style={{ color: "#fff" }}>Payment Mode</th>
                  <th style={{ color: "#fff" }}>Status</th>
                  <th style={{ color: "#fff" }}>Bill Total</th>
                  <th style={{ color: "#fff" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        color: t.muted,
                        textAlign: "center",
                        padding: "40px 14px",
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 13,
                      }}
                    >
                      {search ? "No cancellations match your search." : "No results."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((o) => (
                    <tr key={o.id}>
                      <td style={{ color: t.text, fontWeight: 700, borderBottomColor: t.border }}>
                        #{o.id}
                      </td>
                      <td style={{ color: t.subtle, borderBottomColor: t.border }}>
                        Delivery
                      </td>
                      <td style={{ color: t.subtle, borderBottomColor: t.border }}>
                        {fmtDate(o.created_at)}
                      </td>
                      <td style={{ color: t.subtle, borderBottomColor: t.border }}>
                        {o.Customer?.ph_num || "—"}
                      </td>
                      <td style={{ color: t.text, fontWeight: 600, borderBottomColor: t.border }}>
                        {o.Customer?.cust_name || "—"}
                      </td>
                      <td style={{ color: t.subtle, borderBottomColor: t.border }}>
                        {o.payment_method || "—"}
                      </td>
                      <td style={{ borderBottomColor: t.border }}>
                        <span
                          style={{
                            background: "rgba(184,50,50,0.08)",
                            color: "#B83232",
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 99,
                          }}
                        >
                          Cancelled
                        </span>
                      </td>
                      <td style={{ color: t.accent, fontWeight: 700, borderBottomColor: t.border }}>
                        {fmtKD(o.total_amount)}
                      </td>
                      <td style={{ borderBottomColor: t.border }}>
                        <CancelOrderDetailButton order={o} t={t} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                color: page === 0 ? t.muted : t.text,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                padding: "8px 18px",
                borderRadius: 8,
                cursor: page === 0 ? "not-allowed" : "pointer",
                opacity: page === 0 ? 0.6 : 1,
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                color: page >= totalPages - 1 ? t.muted : t.text,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                padding: "8px 18px",
                borderRadius: 8,
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                opacity: page >= totalPages - 1 ? 0.6 : 1,
              }}
            >
              Next
            </button>
          </div>

          {filtered.length > 0 && (
            <p style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 12, marginTop: 8, textAlign: "right" }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} cancellation{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── CancelOrderDetailButton — portal-based modal with full price breakdown ────
function CancelOrderDetailButton({ order, t }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const loadData = async () => {
    if (fetched) { setOpen(true); return; }
    setLoadingItems(true);
    try {
      const [itemsRes, discountRes] = await Promise.all([
        supabase
          .from("Order_Items")
          .select("id, quantity, unit_price, subtotal, item_note, Menu(name)")
          .eq("order_id", order.id),
        supabase
          .from("Discount_Redemptions")
          .select("amount_saved, Discounts(code, type, value)")
          .eq("order_id", order.id)
          .maybeSingle(),
      ]);
      setItems(itemsRes.data || []);
      if (discountRes.data) {
        setDiscount({
          code: discountRes.data.Discounts?.code || "—",
          type: discountRes.data.Discounts?.type || "fixed",
          value: discountRes.data.Discounts?.value ?? 0,
          amount_saved: Number(discountRes.data.amount_saved || 0),
        });
      }
      setFetched(true);
      setOpen(true);
    } catch (e) {
      console.error("[CancelOrderDetail]", e);
      setFetched(true);
      setOpen(true);
    } finally {
      setLoadingItems(false);
    }
  };

  // Computed bill values
  const itemsSubtotal = items.reduce(
    (s, it) => s + Number(it.subtotal ?? it.unit_price * it.quantity ?? 0), 0
  );
  const deliveryFee = 0.5;
  const discountAmt = discount?.amount_saved ?? 0;

  const modal = open ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.52)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: 24,
          width: "min(500px, calc(100vw - 32px))",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text, fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>
              Order #{order.id}
            </p>
            <p style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 12, marginTop: 3 }}>
              {fmtDate(order.created_at)}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{
              background: "rgba(184,50,50,0.10)",
              color: "#B83232",
              border: "1px solid rgba(184,50,50,0.25)",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              padding: "4px 11px",
              borderRadius: 99,
              letterSpacing: ".04em",
            }}>
              Cancelled
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: t.surface2,
                border: `1px solid ${t.border2}`,
                borderRadius: 8,
                cursor: "pointer",
                color: t.muted,
                fontSize: 16,
                lineHeight: 1,
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Customer ── */}
        <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
          <p style={{ color: t.subtle, fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 7 }}>Customer</p>
          <p style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
            {order.Customer?.cust_name || "—"}
          </p>
          <p style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 13 }}>
            {order.Customer?.ph_num || "—"}
          </p>
        </div>

        {/* ── Items ── */}
        <p style={{ color: t.subtle, fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Items</p>
        {loadingItems ? (
          <p style={{ color: t.muted, fontSize: 13, fontFamily: "'Lato', sans-serif", marginBottom: 18 }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ color: t.muted, fontSize: 13, fontFamily: "'Lato', sans-serif", marginBottom: 18 }}>No items recorded.</p>
        ) : (
          <div style={{ marginBottom: 18, border: `1px solid ${t.border}`, borderRadius: 10, overflow: "hidden" }}>
            {items.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "11px 14px",
                  borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : "none",
                  background: t.surface,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontWeight: 600, fontSize: 13, marginBottom: it.item_note ? 3 : 0 }}>
                    ×{it.quantity} {it.Menu?.name || "Item"}
                  </p>
                  {it.item_note && (
                    <p style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 11, fontStyle: "italic" }}>📝 {it.item_note}</p>
                  )}
                </div>
                <p style={{ color: t.accent, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {fmtKD(it.subtotal ?? it.unit_price * it.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Bill Summary ── */}
        <p style={{ color: t.subtle, fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Bill Summary</p>
        <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: order.notes ? 16 : 0 }}>
          {/* Payment method */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${t.border}` }}>
            <span style={{ color: t.muted, fontFamily: "'Lato', sans-serif", fontSize: 13 }}>Payment method</span>
            <span style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontWeight: 600, fontSize: 13 }}>
              {order.payment_method || "—"}
            </span>
          </div>

          {/* Items subtotal */}
          {!loadingItems && items.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: t.subtle, fontFamily: "'Lato', sans-serif", fontSize: 13 }}>Items subtotal</span>
              <span style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontWeight: 500, fontSize: 13 }}>{fmtKD(itemsSubtotal)}</span>
            </div>
          )}

          {/* Delivery fee */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: discountAmt > 0 ? 8 : 0 }}>
            <span style={{ color: t.subtle, fontFamily: "'Lato', sans-serif", fontSize: 13 }}>Delivery fee</span>
            <span style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontWeight: 500, fontSize: 13 }}>{fmtKD(deliveryFee)}</span>
          </div>

          {/* Discount row — only if coupon was applied */}
          {discount && discountAmt > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: t.green, fontFamily: "'Lato', sans-serif", fontSize: 13 }}>
                🏷️
                <span style={{
                  background: t.greenBg,
                  border: `1px solid ${t.greenBorder}`,
                  color: t.green,
                  borderRadius: 999,
                  padding: "1px 8px",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".04em",
                  fontFamily: "'Lato', sans-serif",
                }}>
                  {discount.code}
                </span>
                <span style={{ color: t.muted, fontSize: 11, fontFamily: "'Lato', sans-serif" }}>
                  ({discount.type === "percentage" ? `${discount.value}% off` : `KD ${Number(discount.value).toFixed(3)} off`})
                </span>
              </span>
              <span style={{ color: t.green, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13 }}>
                −{fmtKD(discountAmt)}
              </span>
            </div>
          )}

          {/* Grand total */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${t.border}`, marginTop: 12 }}>
            <span style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 15 }}>Total</span>
            <span style={{ color: t.accent, fontFamily: "'Lato', sans-serif", fontWeight: 800, fontSize: 16 }}>{fmtKD(order.total_amount)}</span>
          </div>
        </div>

        {/* ── Order Note ── */}
        {order.notes && (
          <div style={{ marginTop: 16, padding: "11px 14px", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10 }}>
            <p style={{ color: t.subtle, fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>Order Note</p>
            <p style={{ color: t.text, fontFamily: "'Lato', sans-serif", fontSize: 13, fontStyle: "italic" }}>"{order.notes}"</p>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => open ? setOpen(false) : loadData()}
        style={{
          background: t.accentBg,
          border: `1px solid ${t.accentBorder}`,
          color: t.accent,
          fontFamily: "'Lato', sans-serif",
          fontWeight: 600,
          fontSize: 12,
          padding: "5px 14px",
          borderRadius: 6,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {loadingItems ? "…" : "View"}
      </button>
      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}

// ─── Root Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState("home");
  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [liveNewCount, setLiveNewCount] = useState(0);
  const [liveAcceptedCount, setLiveAcceptedCount] = useState(0);

  const t = darkMode ? DARK : LIGHT;
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;

  // Live order counts for header badges
  useEffect(() => {
    if (!restId) return;
    const fetchCounts = async () => {
      const { data } = await supabase
        .from("Orders")
        .select("id, status")
        .eq("rest_id", restId)
        .in("status", ["pending", "accepted", "preparing", "on_the_way"]);
      const rows = data || [];
      setLiveNewCount(rows.filter((o) => o.status === "pending").length);
      setLiveAcceptedCount(
        rows.filter((o) =>
          ["accepted", "preparing", "on_the_way"].includes(o.status),
        ).length,
      );
    };
    fetchCounts();
    const ch = supabase
      .channel(`dash-counts-${restId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Orders",
          filter: `rest_id=eq.${restId}`,
        },
        fetchCounts,
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [restId]);

  const newCount = liveNewCount;
  const acceptedCount = liveAcceptedCount;

  const renderPage = () => {
    switch (activeNav) {
      case "home":
        return <HomePage t={t} user={user} />;
      case "orders":
        return <OrdersPage t={t} user={user} />;
      case "delivery":
        return <DeliveryPage t={t} user={user} />;
      case "customers":
        return <CustomersPage t={t} user={user} />;
      case "broadcast":
        return <BroadcastPage t={t} user={user} />;
      case "menu":
        return <MenuPage t={t} user={user} />;
      case "discounts":
        return <DiscountsPage t={t} user={user} />;
      case "cancellations":
        return <CancellationsPage t={t} user={user} />;
      default:
        return (
          <div className="p-8 flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: t.text,
                }}
                className="text-2xl font-bold mb-2"
              >
                {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
              </p>
              <p
                style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                className="text-sm"
              >
                Coming soon
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: t.bg, fontFamily: "'Lato', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;600;700&display=swap');
        body { margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${t.scrollTrack}; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
      `}</style>

      {/* Fixed header */}
      <header
        style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
        className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 z-50"
      >
        <div className="flex items-center gap-3">
          <button
            style={{ color: t.subtle }}
            className="md:hidden text-xl w-8 h-8 flex items-center justify-center"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            ☰
          </button>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: t.accent,
            }}
            className="text-2xl font-bold tracking-tight"
          >
            Ungrie
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div
            style={{
              background: t.accentBg,
              border: `1px solid ${t.accentBorder}`,
              cursor: "pointer",
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:opacity-80 active:scale-95 transition-all"
            onClick={() => setActiveNav("orders")}
            title="View new orders"
          >
            <span
              style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
              className="text-xs font-medium"
            >
              New
            </span>
            <span
              style={{ background: t.accent, color: "#fff" }}
              className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {newCount}
            </span>
          </div>
          <div
            style={{
              background: t.greenBg,
              border: `1px solid ${t.greenBorder}`,
              cursor: "pointer",
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:opacity-80 active:scale-95 transition-all"
            onClick={() => setActiveNav("orders")}
            title="View accepted orders"
          >
            <span
              style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
              className="text-xs font-medium"
            >
              Accepted
            </span>
            <span
              style={{
                background: t.green,
                color: darkMode ? "#0a1f10" : "#fff",
              }}
              className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {acceptedCount}
            </span>
          </div>
          <div
            style={{ background: t.surface2, border: `1px solid ${t.border2}` }}
            className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5"
          >
            <span
              style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
              className="text-xs font-medium"
            >
              Delivery
            </span>
            <Toggle value={delivery} onChange={setDelivery} t={t} />
          </div>
          <div
            style={{ background: t.surface2, border: `1px solid ${t.border2}` }}
            className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5"
          >
            <span
              style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
              className="text-xs font-medium"
            >
              Pickup
            </span>
            <Toggle value={pickup} onChange={setPickup} t={t} />
          </div>
          <ThemeBtn
            dark={darkMode}
            onToggle={() => setDarkMode((d) => !d)}
            t={t}
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/*
          FIX 1 — Sidebar sign-out visibility on mobile:
          Changed h-[calc(100vh-64px)] to use dvh (dynamic viewport height) which
          accounts for mobile browser chrome (address bar). Also restructured the
          sidebar so nav scrolls independently while the user/sign-out footer is
          always pinned at the bottom regardless of nav item count.
        */}
        <aside
          className={`
            flex-shrink-0 flex flex-col
            fixed md:static top-16 left-0 z-40
            w-52
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          style={{
            background: t.surface,
            borderRight: `1px solid ${t.border}`,
            // Use dvh so mobile browser chrome is excluded from the height calculation.
            // Falls back to svh, then vh for older browsers.
            height: "calc(100dvh - 64px)",
          }}
        >
          {/* Nav items — scrollable independently */}
          <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto min-h-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                }}
                style={{
                  background: activeNav === item.id ? t.accent : "transparent",
                  color: activeNav === item.id ? "#fff" : t.subtle,
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 w-full hover:opacity-80"
              >
                <span className="text-base">{item.icon}</span>
                <span
                  style={{ fontFamily: "'Lato', sans-serif" }}
                  className="text-sm font-medium flex-1"
                >
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      background:
                        activeNav === item.id
                          ? "rgba(255,255,255,0.25)"
                          : t.surface2,
                      color: activeNav === item.id ? "#fff" : t.text,
                    }}
                    className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/*
            FIX: User info + sign-out pinned at bottom with flex-shrink-0.
            Previously this could get squeezed off-screen when nav was too tall.
          */}
          <div
            style={{ borderTop: `1px solid ${t.border}` }}
            className="p-4 flex-shrink-0"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                style={{
                  background: t.accentBg,
                  border: `1px solid ${t.accentBorder}`,
                  color: t.accent,
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              >
                {(user.name || user.username || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p
                  style={{ color: t.text, fontFamily: "'Lato', sans-serif" }}
                  className="text-sm font-semibold truncate"
                >
                  {user.name || user.username || user.id}
                </p>
                <p
                  style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
                  className="text-xs capitalize"
                >
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{ color: t.muted, fontFamily: "'Lato', sans-serif" }}
              className="text-xs hover:opacity-70 transition-opacity font-medium"
            >
              ← Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main
          style={{ background: t.bg }}
          className={`flex-1 min-w-0 ${["orders", "menu"].includes(activeNav) ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}