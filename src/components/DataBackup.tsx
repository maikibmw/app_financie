'use client';

import { useRef, useState } from 'react';
import { Transaction, Category, Budget } from '@/types';

// Tvar zálohovaného súboru. "version" nám v budúcnosti umožní
// bezpečne meniť formát bez toho, aby sme pokazili staré zálohy.
interface BackupFile {
  app: 'app-financie';
  version: 1;
  exportedAt: string;
  data: {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
  };
}

interface DataBackupProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  onImport: (data: { transactions: Transaction[]; categories: Category[]; budgets: Budget[] }) => void;
}

export default function DataBackup({
  transactions,
  categories,
  budgets,
  onImport,
}: DataBackupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // --- EXPORT: stiahne všetky dáta ako súbor .json ---
  const handleExport = () => {
    const backup: BackupFile = {
      app: 'app-financie',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { transactions, categories, budgets },
    };

    const jsonText = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const today = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `financie-zaloha-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({ type: 'ok', text: 'Záloha bola stiahnutá do súboru.' });
  };

  // --- IMPORT: načíta súbor .json a overí, či je platný ---
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);

        // Základné overenie, že ide naozaj o našu zálohu.
        const isValid =
          parsed &&
          parsed.app === 'app-financie' &&
          parsed.data &&
          Array.isArray(parsed.data.transactions) &&
          Array.isArray(parsed.data.categories) &&
          Array.isArray(parsed.data.budgets);

        if (!isValid) {
          setMessage({
            type: 'error',
            text: 'Tento súbor nevyzerá ako platná záloha aplikácie Financie.',
          });
          return;
        }

        const confirmed = confirm(
          'Naozaj chceš načítať túto zálohu? Nahradí VŠETKY aktuálne dáta v aplikácii ' +
            '(transakcie, kategórie aj rozpočty).'
        );
        if (!confirmed) return;

        onImport({
          transactions: parsed.data.transactions,
          categories: parsed.data.categories,
          budgets: parsed.data.budgets,
        });

        setMessage({ type: 'ok', text: 'Záloha bola úspešne načítaná.' });
      } catch {
        setMessage({
          type: 'error',
          text: 'Súbor sa nepodarilo prečítať. Skontroluj, či ide o správny .json súbor.',
        });
      }
    };

    reader.readAsText(file);

    // Vyčistíme input, aby sa dal ten istý súbor načítať aj druhýkrát.
    e.target.value = '';
  };

  return (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Záloha dát</h2>
          <p className="text-sm text-gray-500">
            Stiahni si svoje dáta do súboru, alebo obnov appku zo skoršej zálohy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            ⬇ Stiahnuť zálohu
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-gray-50 text-slate-800 font-medium px-4 py-2 rounded-md text-sm border border-gray-300 transition-colors"
          >
            ⬆ Načítať zálohu
          </button>
          {/* Skrytý input na výber súboru; spúšťa ho tlačidlo vyššie. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
      </div>

      {message && (
        <p
          className={`text-sm rounded-md px-3 py-2 ${
            message.type === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="text-xs text-gray-400">
        Tip: zálohu si sprav vždy, keď zadáš veľa nových údajov. Súbor si môžeš uložiť
        do cloudu alebo poslať e-mailom ako poistku.
      </p>
    </section>
  );
}