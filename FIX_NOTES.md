# Fix Daily Reset — frontend-only

Correzioni applicate:

1. `frontend/src/api.ts` ora è frontend-only:
   - nessun backend
   - nessun MongoDB
   - nessuna variabile `EXPO_PUBLIC_BACKEND_URL`
   - genera il reset direttamente nel frontend con logica rule-based
   - salva reset e email lead in `AsyncStorage`/storage locale

2. `frontend/package.json` ora include:
   - `"build": "expo export --platform web"`

3. Scroll mobile corretto:
   - cambio step del check-in torna in alto
   - schermata risultato torna in alto
   - nuovo reset riparte dall'inizio

Impostazioni Vercel consigliate:

- Root Directory: `frontend`
- Build Command: `yarn build`
- Output Directory: `dist`
- Install Command: `yarn install`

Nota:
La raccolta email è salvata solo localmente nel browser/dispositivo. Per una raccolta reale va collegato un form esterno o un servizio email marketing.
