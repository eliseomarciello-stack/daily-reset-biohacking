# Daily Reset — Biohacking Quotidiano (MVP)

## Overview
Web/mobile app (Expo React Native + FastAPI + MongoDB) that provides a daily evening biohacking check-in and generates a rule-based "Daily Reset" summary in Italian. Not a habit tracker, not medical.

## Stack
- Frontend: Expo Router SDK 54 (React Native 0.81, react-native-web). No auth in MVP.
- Backend: FastAPI + Motor + MongoDB. Rule-based logic in `backend/reset_logic.py`.
- Language: Italian UI only.

## Screens (bottom tabs)
1. **Home** — brand header (Biohacking Quotidiano logo), title "Daily Reset", CTA "Inizia il reset".
2. **Nuovo Reset (Check-in)** — 4-step flow (Energia/Mente, Corpo/Recupero, Alimentazione, Routine/Intenzione). Progress "Step X di 4". 1–5 stepper for scores, choice chips for options.
3. **Storico** — list of past resets (date, pattern, micro-action). Tap opens `/result?id=`.
4. **Info** — description, how it works, disclaimer, link to biohackingquotidiano.com.

## API
- `POST /api/resets` — receive check-in, generate reset, save to Mongo.
- `GET /api/resets` — list saved resets (desc by created_at).
- `GET /api/resets/{id}` — get single reset.
- `POST /api/email-leads` — save an email lead (idempotent by email).

## Design
- Brand accent: teal green `#307d7c` (from biohackingquotidiano.com logo), dark teal `#142f34` used for pattern hero.
- Warm off-white surface `#FAF9F6`, white cards with soft shadow.
- Font: system sans-serif. No emojis in UI (Ionicons).
- Max content width 720px on desktop.

## Rule-based patterns
`Recupero insufficiente`, `Carico alto`, `Energia instabile`, `Focus frammentato`, `Alimentazione disordinata`, `Routine saltata`, `Stress alto`, `Buona base da mantenere`, `Energia stabile`, `Giornata da consolidare`.

## MongoDB collections
- `resets` — full reset docs with UUID `id`, ISO `created_at`, input answers + generated_* fields.
- `email_leads` — `{id, email, created_at}` unique by email.
