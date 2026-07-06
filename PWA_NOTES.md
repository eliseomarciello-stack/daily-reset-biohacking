# Daily Reset — PWA notes

Questa versione aggiunge supporto PWA installabile da browser:

- `frontend/public/manifest.json`
- icone PWA 192x192, 512x512 e apple-touch-icon
- service worker minimale `frontend/public/sw.js`
- registrazione service worker in `frontend/app/+html.tsx`
- meta tag mobile/Apple e theme-color
- header Vercel per manifest e service worker

Dopo il deploy su Vercel, testare da Chrome Android: aprire il menu ⋮ e cercare “Installa app” o “Aggiungi a schermata Home”.
Su iPhone: Safari → Condividi → Aggiungi alla schermata Home.
