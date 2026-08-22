Aplikácia Financie
Jednoduchý webový správca rodinných financií — prehľad príjmov a výdavkov,
plánované (očakávané) platby, mesačné rozpočty a evidencia zmlúv/paušálov
s upozornením na možné úspory.
> **Aktuálny stav:** funkčné MVP, ktoré beží celé v prehliadači.
> Dáta sa ukladajú lokálne do `localStorage` (žiadny backend, žiadna databáza,
> žiadne prihlásenie). Podrobný plán ďalšieho vývoja je v [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).
---
Čo appka vie
Príjmy a výdavky – pridávanie transakcií s kategóriou, sumou a dátumom.
Očakávané platby – transakcie so stavom „Očakávané" s dátumom splatnosti;
jedným klikom (tlačidlo DONE) sa označia ako uhradené a presunú do bilancie.
Opakované platby – týždenné / mesačné / ročné; po uhradení sa automaticky
vytvorí ďalšia plánovaná platba na nasledujúci termín.
Mesačné rozpočty – limit na kategóriu s vizuálnym ukazovateľom čerpania.
Správa zmlúv a viazaností – evidencia poskytovateľa, čísla zmluvy a konca
viazanosti; pri niektorých kategóriách zobrazí tip na trhovú cenu a možnú úsporu.
Vlastné kategórie – pridávanie a mazanie kategórií vrátane farby.
Vzorové dáta – tlačidlom „Obnoviť vzorové dáta" sa appka vráti do
východiskového stavu (užitočné pri testovaní).
---
Technológie
Next.js 16 (App Router) + React 19
TypeScript
Tailwind CSS 4
Ukladanie dát: localStorage v prehliadači
---
Spustenie na vlastnom počítači
Potrebuješ nainštalovaný Node.js (verzia 20 alebo novšia).
```bash
# 1. Nainštaluj závislosti
npm install

# 2. Spusti vývojový server
npm run dev
```
Potom otvor v prehliadači http://localhost:3000.
Ďalšie príkazy:
```bash
npm run build   # produkčný build (overí, že sa všetko správne skompiluje)
npm run start   # spustí produkčný build
npm run lint    # kontrola kvality kódu (ESLint)
```
---
Štruktúra projektu
```
src/
├─ app/
│  ├─ layout.tsx        # základný HTML obal stránky
│  ├─ page.tsx          # hlavná stránka – stav appky a väčšina UI
│  └─ globals.css       # globálne štýly (Tailwind)
├─ components/
│  ├─ BudgetManager.tsx    # mesačné rozpočty
│  ├─ CategoryManager.tsx  # správa kategórií
│  └─ ContractManager.tsx  # zmluvy, viazanosti a tipy na úspory
├─ data/
│  └─ mockData.ts       # východiskové kategórie, vzorové transakcie a benchmarky
└─ types/
   └─ index.ts          # spoločné TypeScript typy (Transaction, Category, Budget…)
```
---
Dôležité: dáta a súkromie
Všetky dáta zostávajú len v tvojom prehliadači (localStorage). To znamená:
dáta sa neposielajú nikam na internet a nie sú zálohované,
ak vymažeš históriu prehliadača alebo otvoríš appku v inom prehliadači/zariadení,
dáta tam nebudú,
appka je zatiaľ určená pre jedného používateľa na jednom zariadení.
Zdieľanie medzi členmi rodiny, prihlásenie a záloha v cloude sú naplánované
v ďalších fázach — pozri `PROJECT_PLAN.md`.