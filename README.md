<p align="center">
  <img src="docs/readme/banner.svg" alt="Snap&amp;Sort — pametno razvrstavanje otpada" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-DB-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

# Snap&Sort

**Snap&Sort** je mobilno-prilagođena web aplikacija za **razvrstavanje kućnog otpada** s fokusom na **Zagreb** (boje kanti, kalendar odvoza, korisne lokacije). Korisnik fotografira otpad, dobije **AI prijedlog kategorije**, uči kamo ga odlagati i skuplja **bodove, bedževe i statistiku po vrstama** — sve povezano s **Supabase** autentifikacijom i profilom.

> Dizajn i UX temelje se na [Figma maketi Snap&Sort](https://www.figma.com/design/WNyvu6PY8MPDS9oPJ0V7jg/Snap-Sort-App-Design).

---

## Galerija (vizualni pregled)

| Sken &amp; AI | Karta | Kalendar | Profil |
|:---:|:---:|:---:|:---:|
| ![Sken](docs/readme/feature-scan.svg) | ![Karta](docs/readme/feature-map.svg) | ![Kalendar](docs/readme/feature-calendar.svg) | ![Profil](docs/readme/feature-profile.svg) |

**Stvarne snimke zaslona:** dodaj PNG/WebP datoteke u `docs/screenshots/` (npr. `scan.png`, `map.png`) i u tablicu iznad zamijeni `src` s relativnim putanjama — GitHub će ih lijepo prikazati u README-u.

---

## Ključne mogućnosti

- **Sken slike** — klasifikacija pomoću **Groq** vision modela (Llama 4 Scout); nevaljane slike se odbijaju bez lažne kategorije.
- **Rezultat po kategoriji** — savjeti za **baterije, plastiku, papir, staklo, tekstil, bio, miješani** otpad (Zagreb-style).
- **Interaktivna karta** — **Leaflet**; opcijski Google Maps sloj; zeleni otoci i slične točke.
- **Kalendar odvoza** — referentni raspored za Zagreb, poveznice na službene izvore i (opcionalno) **Razvrstaj MojZG** za adresu.
- **Profil &amp; gamifikacija** — bodovi po vrsti, niz dana, bedževi; **Supabase** čuva `waste_by_type` i agregate nakon skenova.
- **EKO asistent** — opcijski chat s **Google Gemini** za pitanja o recikliranju.
- **Lokalizacija** — hrvatski / engleski UI.

---

## Tehnologije

| Sloj | Izbor |
|------|--------|
| UI | React 18, Tailwind CSS 4, Radix UI, Motion, Lucide |
| Routing | React Router 7 |
| Backend / auth | Supabase (Auth, Postgres, RLS, RPC) |
| AI | Groq (sken), Google Generative AI (chat) |
| Karta | Leaflet, react-leaflet, opc. Google Maps mutant |

---

## Brzi start

```bash
git clone <repo-url>
cd CurosorHakaton1
npm install
cp .env.example .env
# Uredi .env — obavezno Supabase URL i anon key
npm run dev
```

Aplikacija je na `http://localhost:5173` (standardni Vite port).

### Produkcijski build

```bash
npm run build
```

Izlaz je u mapi `dist/`.

### Ostalo

- **`npm run build:zeleni`** — pomoćni skript za GeoJSON (zeleni otoci), ako ga koristite u workflowu.

---

## Okolina (`.env`)

Kopiraj `.env.example` u `.env` i postavi vrijednosti (`.env` je u `.gitignore`).

| Varijabla | Obavezno | Opis |
|-----------|----------|------|
| `VITE_SUPABASE_URL` | da | URL projekta na Supabaseu |
| `VITE_SUPABASE_ANON_KEY` | da | Anon (javni) ključ |
| `VITE_GROQ_API_KEY` | ne | Sken / vision klasifikacija |
| `VITE_GROQ_VISION_MODEL` | ne | Override modela (default u kodu) |
| `VITE_GEMINI_API_KEY` | ne | EKO asistent |
| `VITE_GEMINI_MODEL` | ne | Override Gemini modela |
| `VITE_GOOGLE_MAPS_API_KEY` | ne | Google sloj na karti (inače OSM) |

**Napomena:** `VITE_*` varijable ugrađuju se u klijentski bundle — za produkciju API ključeve za AI preporučljivo je držati iza vlastitog proxyja.

---

## Baza (Supabase)

Migracije su u `supabase/migrations/`. Uključuju tablicu `users`, trigger na registraciju, RPC `record_user_scan` (bodovi, niz, brojači po vrsti u `waste_by_type`), itd.

```bash
# lokalno / deploy prema vašem workflowu
supabase db push
```

---

## Struktura ruta

| Put | Zaslon |
|-----|--------|
| `/login` | Prijava |
| `/` | Sken |
| `/map` | Karta |
| `/calendar` | Kalendar |
| `/profile` | Profil |
| `/result/:category` | Rezultat nakon klasifikacije |

---

## Tim

<p align="center">
  <strong>Josip Bušelić</strong> · <strong>Roko Matek</strong> · <strong>Jurica Šlibar</strong> · <strong>Fran Kramberger</strong>
</p>

<p align="center"><em>Hakaton / timski projekt — hvala cijelom timu na radu.</em></p>

---

## Licenca

Privatni repozitorij (`private` u `package.json`). Za vanjsku upotrebu dodajte odgovarajuću licencu.
