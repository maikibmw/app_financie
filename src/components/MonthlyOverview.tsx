'use client';

interface MonthlyOverviewProps {
  monthLabel: string;
  income: number;
  fixedObligations: number;
  envelopes: number;
  goals: number;
  free: number;
  perDay: number;
  remainingDays: number;
  hasIncome: boolean;
}

export default function MonthlyOverview({
  monthLabel,
  income,
  fixedObligations,
  envelopes,
  goals,
  free,
  perDay,
  remainingDays,
  hasIncome,
}: MonthlyOverviewProps) {
  const isNegative = free < 0;
  const heroColor = isNegative ? 'var(--neg)' : 'var(--ink)';

  const rows = [
    { icon: '↙', label: 'Očakávaný príjem', hint: '', value: income, sign: '+', positive: true, dim: false },
    { icon: '📄', label: 'Fixné záväzky', hint: 'hypotéka, paušály, poistky', value: fixedObligations, sign: '−', positive: false, dim: false },
    { icon: '👛', label: 'Obálky', hint: 'potraviny, zábava (paušálne)', value: envelopes, sign: '−', positive: false, dim: false },
    { icon: '🎯', label: 'Sporenie na ciele', hint: goals > 0 ? 'podľa tvojich cieľov' : 'zatiaľ žiadne ciele', value: goals, sign: '−', positive: false, dim: goals === 0 },
  ];

  return (
    <section className="fin-card-hero p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>
            Koľko mi ostáva ({monthLabel})
          </p>
          <p className="text-4xl font-semibold mt-1" style={{ color: heroColor }}>
            {free.toFixed(2)} €
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--ink-faint)' }}>
            {!hasIncome
              ? 'Zadaj svoj príjem (výplatu), aby appka vedela počítať.'
              : isNegative
              ? `Tvoje záväzky prevyšujú príjem o ${Math.abs(free).toFixed(2)} €.`
              : `voľné na míňanie · ostáva ${remainingDays} dní · ≈ ${perDay.toFixed(2)} € na deň`}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: isNegative ? 'var(--neg-soft)' : 'var(--pos-soft)' }}
        >
          {isNegative ? '⚠️' : '💰'}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-3 py-2.5 rounded-2xl"
            style={{
              background: r.positive ? 'var(--pos-soft)' : 'transparent',
              opacity: r.dim ? 0.55 : 1,
            }}
          >
            <span className="text-sm" style={{ color: r.positive ? 'var(--pos)' : 'var(--ink)' }}>
              {r.icon} {r.label}{' '}
              {r.hint && <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>{r.hint}</span>}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: r.positive ? 'var(--pos)' : 'var(--ink)' }}
            >
              {r.sign} {r.value.toFixed(2)} €
            </span>
          </div>
        ))}

        <div className="h-px my-2" style={{ background: 'var(--brand-border)' }} />

        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            Voľné na míňanie
          </span>
          <span className="text-lg font-bold" style={{ color: isNegative ? 'var(--neg)' : 'var(--pos)' }}>
            = {free.toFixed(2)} €
          </span>
        </div>
      </div>
    </section>
  );
}