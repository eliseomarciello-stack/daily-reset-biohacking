// Curated daily tips from the Biohacking Quotidiano philosophy.
// Rule-based: no AI, no medical claims. Just practical suggestions.
export const DAILY_TIPS: string[] = [
  "10 minuti di luce naturale entro un'ora dal risveglio ricalibrano il ritmo di energia meglio di qualsiasi caffè.",
  "Colazione prima proteica, poi carboidrati: meno picchi glicemici, meno craving a metà mattina.",
  "Ultima caffeina entro le 11: il sonno di stanotte ringrazia il tuo pomeriggio di adesso.",
  "Prima ora del mattino: una sola priorità, zero notifiche. Il focus si costruisce lì.",
  "Cammina 10 minuti dopo il pasto principale: glicemia più stabile, digestione più leggera.",
  "5 minuti di respirazione lenta (4 secondi in, 6 secondi fuori) riducono lo stress percepito misurabilmente.",
  "Cena semplice e proteica, con schermi spenti nell'ultima ora: il sonno inizia adesso, non a letto.",
  "Idratazione appena svegli: un bicchiere d'acqua prima di tutto, prima del caffè.",
  "Meglio una routine piccola e ripetibile che una perfetta e saltata.",
  "Movimento leggero > allenamento intenso quando il recupero è basso.",
  "Prepara la sera prima: la mattina ha meno decisioni, più esecuzione.",
  "Non usare la caffeina per coprire stanchezza profonda: la sposta soltanto.",
  "Esposizione al freddo breve (30-60 secondi) a fine doccia: piccolo shock, grande vigilanza.",
  "Fame vera vs craving: aspetta 15 minuti con acqua e proteine. Se resta, era fame.",
  "Alimentazione ordinata > alimentazione perfetta. La costanza batte la teoria.",
  "Sonno regolare (stessi orari) > sonno lungo ma disordinato.",
  "Una micro-pausa di respirazione ogni 90 minuti resetta il focus meglio di un caffè extra.",
  "Se lo stress è alto, riduci le decisioni non essenziali, non aggiungere impegni.",
  "Un pasto proteico entro un'ora dall'allenamento consolida il recupero.",
  "Digital sunset: schermi meno luminosi da 2 ore prima di dormire, cervello ringrazia.",
  "Pianifica la giornata di domani stasera in 3 righe: energia, focus, movimento.",
  "Il corpo si allena, il sistema nervoso si recupera. Riposa entrambi.",
];

/**
 * Deterministic tip-of-the-day based on the current local date.
 * Same tip during the same day, changes at midnight.
 */
export function getDailyTip(now: Date = new Date()): { tip: string; index: number } {
  // yyyy-mm-dd hashed to an index
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const seed = y * 10000 + m * 100 + d;
  const index = seed % DAILY_TIPS.length;
  return { tip: DAILY_TIPS[index], index };
}
