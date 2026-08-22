'use client';

export interface CashflowMonth {
  label: string;
  income: number;
  expense: number;
  net: number;
  isCurrent: boolean;
  isPast: boolean;
  isEmpty: boolean;
}

interface CashflowChartProps {
  months: CashflowMonth[];
}

export default function CashflowChart({ months }: CashflowChartProps) {
  const W = 660;
  const H = 250;
  const padX = 24;
  const padTop = 34;
  const padBottom = 46;
  const chartH = H - padTop - padBottom;

  const nets = months.map((m) => m.net);
  const maxPos = Math.max(0, ...nets);
  const maxNeg = Math.min(0, ...nets);
  const range = maxPos - maxNeg || 1;
  const zeroY = padTop + (maxPos / range) * chartH;

  const n = months.length;
  const slot = (W - padX * 2) / n;
  const barW = slot * 0.46;

  const POS = '#12b981';
  const NEG = '#e0714f';

  // Upozorňujeme len na aktuálny a budúce mesiace (minulé sú kontext).
  const deficitMonths = months.filter((m) => !m.isPast && !m.isEmpty && m.net < 0);

  // Deliaca čiara medzi minulosťou (skutočnosť) a výhľadom (plán).
  const currentIndex = months.findIndex((m) => m.isCurrent);
  const dividerX = currentIndex >= 0 ? padX + slot * (currentIndex + 1) : -1;

  return (
    <section className="fin-card p-6">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Graf výhľadu cashflow">
        {/* Nulová čiara */}
        <line x1={padX} x2={W - padX} y1={zeroY} y2={zeroY} stroke="#e2daf6" strokeWidth={1} strokeDasharray="4 4" />

        {/* Deliaca čiara skutočnosť / plán */}
        {dividerX > 0 && (
          <line x1={dividerX} x2={dividerX} y1={padTop - 6} y2={H - padBottom + 6} stroke="#ece8f6" strokeWidth={1} />
        )}

        {months.map((m, i) => {
          const cx = padX + slot * i + slot / 2;
          const h = m.isEmpty ? 0 : (Math.abs(m.net) / range) * chartH;
          const y = m.net >= 0 ? zeroY - h : zeroY;
          const fill = m.net >= 0 ? POS : NEG;
          const opacity = m.isEmpty ? 0.2 : m.isCurrent ? 1 : m.isPast ? 0.55 : 0.9;

          return (
            <g key={i}>
              {m.isEmpty ? (
                <circle cx={cx} cy={zeroY} r={3} fill="#cbd5e1" />
              ) : (
                <rect x={cx - barW / 2} y={y} width={barW} height={Math.max(2, h)} rx={6} fill={fill} opacity={opacity} />
              )}

              {/* Zvýraznenie aktuálneho mesiaca */}
              {m.isCurrent && !m.isEmpty && (
                <rect
                  x={cx - barW / 2 - 3}
                  y={Math.min(y, zeroY) - 3}
                  width={barW + 6}
                  height={Math.max(2, h) + 6}
                  rx={9}
                  fill="none"
                  stroke={fill}
                  strokeWidth={1.5}
                  opacity={0.4}
                />
              )}

              {/* Hodnota */}
              <text
                x={cx}
                y={m.net >= 0 ? (m.isEmpty ? zeroY - 10 : y - 8) : y + h + 16}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={m.isEmpty ? '#cbd5e1' : m.net >= 0 ? '#047857' : '#c2593f'}
              >
                {m.isEmpty ? '—' : `${m.net >= 0 ? '+' : '−'}${Math.abs(Math.round(m.net))} €`}
              </text>

              {/* Popis mesiaca */}
              <text
                x={cx}
                y={H - padBottom + 22}
                textAnchor="middle"
                fontSize="12"
                fontWeight={m.isCurrent ? 700 : 500}
                fill={m.isCurrent ? '#6b46e0' : '#9ca3af'}
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="mt-2 flex items-center gap-4 flex-wrap text-xs" style={{ color: 'var(--ink-faint)' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: POS }} /> zostáva v pluse
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: NEG }} /> deficit (mínus)
        </span>
        <span>· minulé mesiace = skutočnosť, budúce = plán</span>
      </div>

      {deficitMonths.length > 0 ? (
        <p className="mt-3 text-sm rounded-xl px-3 py-2" style={{ background: 'var(--neg-soft)', color: 'var(--neg)' }}>
          ⚠️ Pozor: v {deficitMonths.map((m) => m.label).join(', ')} ti výdavky prevýšia príjem.
          Odporúčam si vopred odložiť rezervu.
        </p>
      ) : (
        <p className="mt-3 text-sm rounded-xl px-3 py-2" style={{ background: 'var(--pos-soft)', color: 'var(--pos)' }}>
          ✓ Podľa plánu ti v najbližších mesiacoch zostáva v pluse.
        </p>
      )}
    </section>
  );
}