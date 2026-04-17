import { useState, useRef, useCallback, useEffect } from "react";
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
  <div class="footer">FeastRush &nbsp;·&nbsp; ${restaurant?.name || ""} &nbsp;·&nbsp; Z-Report</div>
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

// ─── Customers Page ───────────────────────────────────────────────────────────
function CustomersPage({ t, user }) {
  const restId = user?.role === "owner" ? user?.main_rest : user?.rest_id;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [topN, setTopN] = useState(15);
  const [topNInput, setTopNInput] = useState("15");
  const [sortBy, setSortBy] = useState("revenue"); // revenue | orders | avg

  const load = useCallback(async () => {
    if (!restId) {
      setLoading(false);
      setErr("No restaurant linked.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      // Fetch all delivered/accepted orders for this restaurant
      const { data: orders, error: oErr } = await supabase
        .from("Orders")
        .select("id, cust_id, total_amount, status, created_at")
        .eq("rest_id", restId)
        .in("status", ["delivered", "accepted", "preparing", "on_the_way"]);
      if (oErr) throw oErr;

      // Aggregate per customer
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

      // Fetch customer profiles
      const { data: profiles, error: pErr } = await supabase
        .from("Customer")
        .select("id, cust_name, ph_num, joined_on")
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

  const sorted = [...customers]
    .sort((a, b) => {
      if (sortBy === "orders") return b.orders - a.orders;
      if (sortBy === "avg") return b.avg - a.avg;
      return b.revenue - a.revenue;
    })
    .slice(0, topN);

  const applyTopN = () => {
    const n = parseInt(topNInput, 10);
    if (!isNaN(n) && n > 0 && n <= 1000) setTopN(n);
    else setTopNInput(String(topN));
  };

  const medalColor = (i) =>
    i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#B45309" : t.muted;
  const medalEmoji = (i) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

  const maxRevenue = sorted[0]?.revenue || 1;

  return (
    <div className="p-5 md:p-8 max-w-5xl space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', serif", color: t.text }}
            className="text-3xl md:text-4xl font-bold tracking-tight"
          >
            Customers
          </h1>
          <p
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-sm mt-0.5"
          >
            {loading
              ? "Loading…"
              : `${customers.length} customer${customers.length !== 1 ? "s" : ""} · showing top ${Math.min(topN, customers.length)}`}
          </p>
        </div>
        <button
          onClick={load}
          style={{
            background: t.surface2,
            border: `1px solid ${t.border2}`,
            color: t.subtle,
            fontFamily: "'Lato', sans-serif",
          }}
          className="text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-70 transition-opacity"
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
            fontFamily: "'Lato', sans-serif",
          }}
          className="rounded-xl px-4 py-3 text-sm"
        >
          ⚠️ {err}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sort */}
        <div
          style={{ borderBottom: `1px solid ${t.border}` }}
          className="flex gap-0"
        >
          {[
            ["revenue", "By Revenue"],
            ["orders", "By Orders"],
            ["avg", "By Avg Order"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setSortBy(v)}
              style={{
                color: sortBy === v ? t.accent : t.subtle,
                borderBottomColor: sortBy === v ? t.accent : "transparent",
                fontFamily: "'Lato', sans-serif",
              }}
              className="pb-2 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap tracking-wider uppercase"
            >
              {l}
            </button>
          ))}
        </div>
        {/* Top N control */}
        <div className="flex items-center gap-2 ml-auto">
          <span
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-semibold whitespace-nowrap"
          >
            Show top
          </span>
          <input
            type="number"
            min={1}
            max={1000}
            value={topNInput}
            onChange={(e) => setTopNInput(e.target.value)}
            onBlur={applyTopN}
            onKeyDown={(e) => e.key === "Enter" && applyTopN()}
            style={{
              background: t.surface2,
              border: `1px solid ${t.border2}`,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
              width: 60,
            }}
            className="rounded-lg px-3 py-1.5 text-sm text-center outline-none font-bold"
          />
          <span
            style={{ color: t.subtle, fontFamily: "'Lato', sans-serif" }}
            className="text-xs font-semibold"
          >
            customers
          </span>
        </div>
      </div>

      {/* Customer cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((k) => (
            <div
              key={k}
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
              className="rounded-xl p-5 animate-pulse"
            >
              <div
                style={{ background: t.surface2 }}
                className="h-4 w-48 rounded-lg mb-3"
              />
              <div
                style={{ background: t.surface2 }}
                className="h-3 w-32 rounded-lg"
              />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
          className="rounded-xl p-12 text-center"
        >
          <div className="text-5xl mb-4 opacity-20">👥</div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: t.text,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            No customers yet
          </p>
          <p
            style={{
              color: t.muted,
              fontSize: 14,
              marginTop: 6,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Customers will appear once orders are placed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c, i) => {
            const barW = (c.revenue / maxRevenue) * 100;
            return (
              <div
                key={c.cust_id}
                style={{
                  background: t.surface,
                  border: `1px solid ${i < 3 ? medalColor(i) + "55" : t.border}`,
                  position: "relative",
                  overflow: "hidden",
                }}
                className="rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                {/* Revenue bar background */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${barW}%`,
                    background: i < 3 ? medalColor(i) + "08" : t.accent + "06",
                    pointerEvents: "none",
                    transition: "width .5s",
                  }}
                />
                <div className="relative flex items-start gap-4 flex-wrap">
                  {/* Rank + Avatar */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div style={{ minWidth: 28, textAlign: "center" }}>
                      {medalEmoji(i) ? (
                        <span style={{ fontSize: 22 }}>{medalEmoji(i)}</span>
                      ) : (
                        <span
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          #{i + 1}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        background: i < 3 ? medalColor(i) + "22" : t.surface2,
                        border: `1px solid ${i < 3 ? medalColor(i) + "44" : t.border2}`,
                        color: i < 3 ? medalColor(i) : t.muted,
                      }}
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                    >
                      {(c.name || "?")[0].toUpperCase()}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p
                        style={{
                          color: t.text,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-base font-bold"
                      >
                        {c.name}
                      </p>
                      {c.phone !== "—" && (
                        <p
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                          }}
                          className="text-xs"
                        >
                          {c.phone}
                        </p>
                      )}
                    </div>
                    {c.lastOrder && (
                      <p
                        style={{
                          color: t.muted,
                          fontFamily: "'Lato', sans-serif",
                        }}
                        className="text-xs"
                      >
                        Last order:{" "}
                        {new Date(c.lastOrder).toLocaleDateString("en-KW", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  {/* Stats grid */}
                  <div className="flex items-center gap-4 flex-shrink-0 flex-wrap">
                    {[
                      { label: "Orders", value: c.orders, color: t.accent },
                      {
                        label: "Total Spent",
                        value: `KD ${c.revenue.toFixed(3)}`,
                        color: t.green,
                      },
                      {
                        label: "Avg Order",
                        value: `KD ${c.avg.toFixed(3)}`,
                        color: t.muted,
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        style={{ textAlign: "center", minWidth: 70 }}
                      >
                        <p
                          style={{
                            color,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 800,
                          }}
                          className="text-xl leading-none"
                        >
                          {value}
                        </p>
                        <p
                          style={{
                            color: t.muted,
                            fontFamily: "'Lato', sans-serif",
                          }}
                          className="text-xs mt-1"
                        >
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
};

// ─── Invoice Generator (opens print dialog with styled HTML) ─────────────────
function printInvoice(order, items, restaurant) {
  const rows = (items || [])
    .map(
      (it) => `
    <tr>
      <td style="padding:8px 12px;color:#555;font-size:13px">${it.quantity}×</td>
      <td style="padding:8px 12px;font-size:13px">
        ${it.menu_name || it.menu_id}
        ${it.item_note ? `<div style="font-size:11px;color:#888;font-style:italic">↳ ${it.item_note}</div>` : ""}
        ${(it.variants || []).map((v) => `<div style="font-size:11px;color:#C4711A">· ${v}</div>`).join("")}
      </td>
      <td style="padding:8px 12px;text-align:right;font-weight:600;font-size:13px">KD ${Number(it.unit_price).toFixed(3)}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700;font-size:13px">KD ${Number(it.subtotal).toFixed(3)}</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Invoice #${order.id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a1a;padding:40px;max-width:680px;margin:0 auto}
    .logo{font-size:28px;font-weight:900;color:#C4711A;letter-spacing:-0.5px}
    .tagline{font-size:11px;color:#999;letter-spacing:.12em;text-transform:uppercase;margin-top:2px}
    .divider{border:none;border-top:1px solid #eee;margin:20px 0}
    .header-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
    .label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#aaa;margin-bottom:4px}
    .value{font-size:14px;font-weight:600;color:#1a1a1a}
    .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:#fff3e0;color:#C4711A;border:1px solid #fed7aa}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    thead th{background:#f9f6f2;padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#888}
    thead th:nth-child(3),thead th:nth-child(4){text-align:right}
    tbody tr:nth-child(even){background:#fafafa}
    tbody tr:last-child td{border-bottom:1px solid #eee}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#555}
    .total-row.grand{font-size:17px;font-weight:800;color:#1a1a1a;border-top:2px solid #1a1a1a;margin-top:8px;padding-top:12px}
    .footer{text-align:center;font-size:11px;color:#bbb;margin-top:36px;padding-top:20px;border-top:1px solid #eee}
    @media print{body{padding:20px}.no-print{display:none}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px">
    <div>
      <div class="logo">${restaurant?.name || "Ungrie"}</div>
      <div class="tagline">${restaurant?.branch_name || "Restaurant"}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:22px;font-weight:800;color:#1a1a1a">INVOICE</div>
      <div style="font-size:13px;color:#888;margin-top:2px">#${order.id}</div>
      <div class="badge" style="margin-top:6px">${STATUS_META[order.status]?.label || order.status}</div>
    </div>
  </div>
  <hr class="divider">
  <div class="header-grid">
    <div>
      <div class="label">Customer</div>
      <div class="value">${order.cust_name || "—"}</div>
      <div style="font-size:13px;color:#555;margin-top:2px">${order.cust_phone || ""}</div>
    </div>
    <div>
      <div class="label">Order date</div>
      <div class="value">${fmtDate(order.created_at)}</div>
    </div>
    <div>
      <div class="label">Payment method</div>
      <div class="value">${order.payment_method}</div>
    </div>
    <div>
      <div class="label">Payment status</div>
      <div class="value">${order.payment_status || "Pending"}</div>
    </div>
    ${order.delivery_rider_name ? `<div><div class="label">Delivery rider</div><div class="value">${order.delivery_rider_name}</div><div style="font-size:13px;color:#555;margin-top:2px">${order.delivery_rider_phone || ""}</div></div>` : ""}
    ${order.notes ? `<div style="grid-column:1/-1"><div class="label">Order notes</div><div style="font-size:13px;color:#555;font-style:italic">${order.notes}</div></div>` : ""}
    ${order.deliveryAddress ? `<div style="grid-column:1/-1"><div class="label">Delivery address</div><div style="font-size:13px;color:#555">${order.deliveryAddress}</div></div>` : ""}
  </div>
  <hr class="divider">
  <table>
    <thead><tr><th>Qty</th><th>Item</th><th>Unit price</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:20px;padding:16px 12px;background:#f9f6f2;border-radius:10px">
    <div class="total-row"><span>Subtotal</span><span>KD ${Number(order.total_amount).toFixed(3)}</span></div>
    <div class="total-row grand"><span>Total</span><span>KD ${Number(order.total_amount).toFixed(3)}</span></div>
  </div>
  <div class="footer">Thank you for ordering from ${restaurant?.name || "us"}! · Powered by Ungrie</div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`;

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
    setActionErr("");
  };

  // ── Computed order lists ───────────────────────────────────────────────────
  const byStatus = {
    pending: orders.filter((o) => o.status === "pending"),
    accepted: orders.filter((o) => o.status === "accepted"),
    preparing: orders.filter((o) => o.status === "preparing"),
    on_the_way: orders.filter((o) => o.status === "on_the_way"),
    history: orders.filter((o) => ["delivered", "rejected"].includes(o.status)),
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
    const isClosed = ["delivered", "rejected"].includes(selectedOrder.status);

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
            className="px-5 py-3 space-y-1"
          >
            <div className="flex justify-between text-sm">
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
            <div
              className="flex justify-between text-sm pt-1"
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
      case "menu":
        return <MenuPage t={t} user={user} />;
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
