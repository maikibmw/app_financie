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

  // Farby hlavného čísla podľa toho, či ostáva alebo chýba.
  const heroColor = isNegative ? 'text-rose-600' : 'text-emerald-700';
  const heroBg = isNegative ? 'bg-rose-50' : 'bg-emerald-50';
  const heroIcon = isNegative ? '⚠️' : '💰';

  return (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Koľko mi ostáva ({monthLabel})</p>
          <p className={`text-3xl font-bold ${heroColor}`}>
            {isNegative ? '' : ''}{free.toFixed(2)} €
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {!hasIncome
              ? 'Zadaj svoj príjem (výplatu), aby appka vedela počítať.'
              : isNegative
              ? `Tvoje záväzky prevyšujú príjem o ${Math.abs(free).toFixed(2)} €.`
              : `voľné na míňanie · ostáva ${remainingDays} dní · ≈ ${perDay.toFixed(2)} € na deň`}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-full ${heroBg} flex items-center justify-center text-2xl`}>
          {heroIcon}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {/* Príjem */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 rounded-md">
          <span className="text-sm text-emerald-700">↙ Očakávaný príjem</span>
          <span className="text-sm font-semibold text-emerald-700">+ {income.toFixed(2)} €</span>
        </div>

        {/* Fixné záväzky */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm text-gray-800">
            📄 Fixné záväzky{' '}
            <span className="text-xs text-gray-400">hypotéka, paušály, poistky</span>
          </span>
          <span className="text-sm font-semibold text-gray-800">− {fixedObligations.toFixed(2)} €</span>
        </div>

        {/* Obálky */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm text-gray-800">
            👛 Obálky{' '}
            <span className="text-xs text-gray-400">potraviny, zábava (paušálne)</span>
          </span>
          <span className="text-sm font-semibold text-gray-800">− {envelopes.toFixed(2)} €</span>
        </div>

        {/* Sporenie na ciele */}
        <div className={`flex items-center justify-between px-3 py-2.5 ${goals > 0 ? '' : 'opacity-60'}`}>
          <span className="text-sm text-gray-800">
            🎯 Sporenie na ciele{' '}
            <span className="text-xs text-gray-400">
              {goals > 0 ? 'podľa tvojich cieľov' : 'zatiaľ žiadne ciele'}
            </span>
          </span>
          <span className={`text-sm font-semibold ${goals > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
            − {goals.toFixed(2)} €
          </span>
        </div>

        <div className="h-px bg-gray-200 my-1.5" />

        {/* Výsledok */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold text-gray-800">Voľné na míňanie</span>
          <span className={`text-lg font-bold ${heroColor}`}>= {free.toFixed(2)} €</span>
        </div>
      </div>
    </section>
  );
}