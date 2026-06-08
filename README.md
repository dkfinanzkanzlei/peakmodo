# PEAKMODO 🏆
**Activate your Peak Mode**

---

## Projektübersicht
Peakmodo ist eine persönliche Ziel-, Habit- und Mentor-App mit KI-Integration.
Die App hilft Nutzern dabei, ihre Ziele zu erreichen durch tägliches Tracking, einen KI-Mentor und einen Schlaf-Coach.

---

## Tech Stack
- **Frontend (Web):** Vanilla HTML/CSS/JS → `index.html`
- **Frontend (Mobile App):** React → `src/PeakmodoApp.jsx`
- **Task Manager:** React → `src/PeakmodoTasks.jsx`
- **Datenbank & Auth:** Supabase
- **Hosting:** Vercel → peakmodo.de
- **KI:** Anthropic Claude API (claude-sonnet-4-20250514)

---

## Zugangsdaten & Keys
```
SUPABASE_URL=https://xofquodeqaydophyykqm.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZnF1b2RlcWF5ZG9waHl5a3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc3MTEsImV4cCI6MjA5NDE1MzcxMX0.-3xuqmo6YJpeCR8-ClBj585C5LuyaR17rUQzoj2qX3Q
```

---

## Design System
- **Farben:** Schwarz `#0A0A0A`, Gold `#C9A84C`, Gold Light `#F5D078`, Gold Dark `#8B6914`, Weiß `#FFFFFF`
- **Gradient:** `linear-gradient(135deg, #F5D078, #C9A84C, #8B6914)`
- **Font:** DM Sans (Google Fonts)
- **Logo:** PEAK (weiß, Bebas Neue) / MODO (gold, Bebas Neue) – gestapelt
- **Slogan:** "Activate your Peak Mode"
- **Style:** Premium, clean, dark, mobile-first

---

## Supabase Tabelle
```sql
create table user_data (
  user_id uuid primary key,
  data jsonb,
  updated_at timestamptz default now()
);
alter table user_data enable row level security;
create policy "Users can manage own data"
  on user_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## Features (bereits gebaut)
- ✅ Login & Registrierung (Supabase Auth)
- ✅ Dashboard mit Produktivitäts-Gauge, KPIs, Heatmap
- ✅ Ziel-Tracker (Titel, Kategorie, Fortschritt, Strategie, Schritte, Deadline)
- ✅ Habit-Tracker mit Streak-System und Tages-Logging
- ✅ KI-Mentor Chat (Claude API)
- ✅ Schlaf-Coach mit Bedtime-Reminder und Techniken
- ✅ Wins / Hall of Fame
- ✅ 18 Motivationssprüche (rotieren täglich)
- ✅ XP-System
- ✅ KI Task Manager (PeakmodoTasks.jsx)
- ✅ Mentor-Charakter (weiser Mann mit Bart, Cartoon-Style)
- ✅ Daten per Account in Supabase gespeichert

---

## To-Do / Offene Features
1. **Supabase Auth Login/Register** – Button funktioniert noch nicht (Infinite Loop Fix nötig)
2. **Freemium-System** – 5 Ziele + 5 Habits kostenlos, dann 9,99€/Monat oder 99,99€/Jahr (Stripe)
3. **Tägliche Push-Notifications** mit Motivationsspruch (PWA)
4. **Onboarding-Flow** für neue Nutzer (Name eingeben, erstes Ziel setzen)
5. **Landing Page** für peakmodo.de (Marketing-Seite)
6. **Datenschutz / Impressum / AGB** Seiten (DSGVO)
7. **Task Manager einbauen** in die Hauptapp (PeakmodoTasks.jsx integrieren)
8. **Stripe Integration** für Abo-Zahlungen
9. **Mobile App** (React Native oder Capacitor Wrapper)
10. **Passwort vergessen** Funktion

---

## Zielkategorien
Finanzen, Business, Gesundheit, Sport, Schlaf, Spiritualität, Produktivität, Beziehungen, Lernen, Persönliche Entwicklung

---

## Mentor-Charakter
Weiser alter Mann im Cartoon-Stil mit weißem Bart, dunkle Robe mit Gold-Verzierungen.
Er spricht direkt, motivierend, ehrlich – nicht weich oder kitschig.

---

## Abo-Modell (geplant)
- **Free:** 5 Ziele, 5 Habits, KI-Mentor (begrenzt)
- **Pro:** 9,99€/Monat oder 99,99€/Jahr – unlimitiert alles
- Zahlung via Stripe
- EU-konform (DSGVO, Widerrufsrecht, AGB)

---

## Dateistruktur
```
peakmodo/
├── index.html          ← Haupt-Webapp (Vercel deployed)
├── src/
│   ├── PeakmodoApp.jsx     ← Mobile App Version (React)
│   └── PeakmodoTasks.jsx   ← KI Task Manager (React)
├── package.json
├── vite.config.js
└── README.md
```

---

## Social Media
- Instagram: @peakmodo
- TikTok: @peakmodo
- Domain: peakmodo.de
