import AsyncStorage from '@react-native-async-storage/async-storage';

const RESETS_KEY = 'daily-reset:resets';
const EMAIL_LEADS_KEY = 'daily-reset:email-leads';
const MAX_RESETS = 50;

export type ResetInput = {
  energy_score: number;
  focus_score: number;
  stress_score: number;
  sleep_score: number;
  movement_type: string;
  body_feeling: string;
  nutrition_status: string;
  cravings_level: string;
  caffeine_use: string;
  natural_light: string;
  routine_done: string;
  improvement_area: string;
  available_time: string;
};

export type Reset = ResetInput & {
  id: string;
  created_at: string;
  generated_pattern: string;
  generated_summary: string;
  generated_worked: string;
  generated_friction: string;
  generated_adjustment: string;
  generated_micro_action: string;
  generated_avoidance: string;
};

type EmailLead = {
  id: string;
  email: string;
  created_at: string;
};

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[local-api] Cannot read ${key}`, error);
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[local-api] Cannot write ${key}`, error);
    throw error;
  }
}

function pickPattern(a: ResetInput): string {
  if (a.sleep_score <= 2 && a.stress_score >= 4) return 'Recupero insufficiente';
  if (a.movement_type === 'allenamento intenso' && a.body_feeling === 'svuotato') return 'Carico alto';
  if (a.energy_score <= 2 && a.caffeine_use === 'troppa') return 'Energia instabile';
  if (a.focus_score <= 2 && a.stress_score >= 4) return 'Focus frammentato';
  if (
    a.nutrition_status === 'molto irregolare' ||
    a.cravings_level === 'alti' ||
    a.nutrition_status === 'troppo ricca di zuccheri/carboidrati'
  ) {
    return 'Alimentazione disordinata';
  }
  if (a.routine_done === 'no' && a.available_time === '5 minuti') return 'Routine saltata';
  if (a.stress_score >= 4) return 'Stress alto';
  if (a.energy_score >= 4 && a.stress_score <= 2 && a.sleep_score >= 4) return 'Buona base da mantenere';
  if (a.energy_score >= 3 && a.focus_score >= 3 && a.stress_score <= 3) return 'Energia stabile';
  return 'Giornata da consolidare';
}

function summary(a: ResetInput, pattern: string): string {
  const openings: Record<string, string> = {
    'Recupero insufficiente': 'Oggi la giornata sembra essere stata più pesante sul piano nervoso che fisico.',
    'Carico alto': 'Oggi il corpo ha lavorato tanto e sta chiedendo di rallentare.',
    'Energia instabile': "Oggi l'energia è rimasta bassa e la caffeina non è riuscita a compensare.",
    'Focus frammentato': 'Oggi il focus è stato disturbato da stress e rumore mentale.',
    'Alimentazione disordinata': "Oggi l'alimentazione ha probabilmente inciso su energia, fame e stabilità.",
    'Routine saltata': 'Oggi è mancato un punto di appoggio semplice nella routine.',
    'Stress alto': 'Oggi il sistema sembra essere rimasto troppo acceso.',
    'Buona base da mantenere': 'Oggi la giornata ha avuto una base solida.',
    'Energia stabile': "Oggi l'energia è stata abbastanza gestibile.",
    'Giornata da consolidare': 'Oggi non emerge un grande crollo, ma neppure una piena stabilità.',
  };

  const parts: string[] = [openings[pattern] ?? openings['Giornata da consolidare']];

  if (a.energy_score <= 2) parts.push("L'energia è stata bassa per gran parte del tempo.");
  else if (a.energy_score >= 4) parts.push("L'energia è rimasta buona.");

  if (a.focus_score <= 2) parts.push('Il focus ha faticato a mantenersi.');
  else if (a.focus_score >= 4) parts.push('Il focus è stato solido.');

  if (a.stress_score >= 4) parts.push('Lo stress si è fatto sentire in modo evidente.');
  else if (a.stress_score <= 2) parts.push('Lo stress è rimasto contenuto.');

  if (a.sleep_score <= 2) parts.push('Il sonno della notte prima non ha aiutato.');
  else if (a.sleep_score >= 4) parts.push('Il sonno ha dato una base di recupero solida.');

  if (['Recupero insufficiente', 'Carico alto', 'Stress alto'].includes(pattern)) {
    parts.push('Domani conviene semplificare, non aggiungere.');
  } else if (pattern === 'Buona base da mantenere') {
    parts.push('Domani basta ripetere quello che ha funzionato oggi.');
  } else {
    parts.push('Domani un piccolo aggiustamento può cambiare la traiettoria della giornata.');
  }

  return parts.join(' ');
}

function whatWorked(a: ResetInput): string {
  if (a.sleep_score >= 4) return 'Il sonno della notte scorsa ha dato una buona base di partenza.';
  if (a.energy_score >= 4) return "L'energia è rimasta abbastanza stabile durante la giornata.";
  if (a.focus_score >= 4) return 'Il focus ha tenuto meglio del previsto, nonostante il resto.';
  if (a.natural_light === 'sì, buona') return "L'esposizione alla luce naturale ha aiutato più di quanto sembri.";
  if (['camminata leggera', 'allenamento leggero'].includes(a.movement_type)) {
    return 'Un movimento leggero è stato una scelta intelligente per la giornata.';
  }
  if (a.routine_done === 'sì') return 'Aver mantenuto una routine, anche piccola, ha fatto da ancora.';
  if (a.routine_done === 'parzialmente') return 'Anche una routine parziale ha tenuto un minimo di continuità.';
  if (a.stress_score <= 2) return 'Lo stress basso è stato una risorsa da non sottovalutare.';
  return 'Essere qui a fare il check-in è già un segnale di consapevolezza.';
}

function friction(a: ResetInput): string {
  if (a.sleep_score <= 2 && a.stress_score >= 4) return 'Poco sonno unito ad alto stress ha creato la frizione principale.';
  if (a.caffeine_use === 'troppa') return "L'eccesso di caffeina ha probabilmente peggiorato ansia e recupero.";
  if (a.nutrition_status === 'molto irregolare') return "Un'alimentazione molto irregolare ha destabilizzato energia e umore.";
  if (a.nutrition_status === 'troppo ricca di zuccheri/carboidrati') return 'Troppi zuccheri e carboidrati veloci hanno creato picchi e crolli.';
  if (a.nutrition_status === 'pesante') return "Un'alimentazione pesante ha rallentato la digestione e il focus.";
  if (a.cravings_level === 'alti') return "Craving alti indicano che qualcosa nell'alimentazione o nel sonno non ha tenuto.";
  if (a.movement_type === 'allenamento intenso' && a.body_feeling === 'svuotato') return 'Un allenamento intenso su una base scarica ha svuotato le riserve.';
  if (['poca', 'quasi nulla'].includes(a.natural_light)) return 'Poca luce naturale ha reso più difficile regolare energia e ritmo.';
  if (a.stress_score >= 4) return 'Lo stress percepito ha assorbito più risorse del necessario.';
  if (a.routine_done === 'no') return 'Saltare del tutto la routine ha tolto un punto d’appoggio alla giornata.';
  return 'Nessun singolo elemento critico, ma diversi piccoli attriti hanno pesato insieme.';
}

function adjustment(a: ResetInput, pattern: string): string {
  const lines: string[] = [];

  if (pattern === 'Recupero insufficiente') {
    lines.push('Domani punta sul recupero: routine leggera, cena semplice e proteica, luce naturale la mattina.');
    lines.push('Evita allenamenti intensi e riduci la caffeina, soprattutto nel pomeriggio.');
  } else if (pattern === 'Carico alto') {
    lines.push('Domani metti il corpo in modalità recupero: camminata facile, mobilità o riposo attivo.');
    lines.push('Priorità a idratazione, proteine e sonno anticipato di 20-30 minuti.');
  } else if (pattern === 'Energia instabile') {
    lines.push('Domani riduci la dipendenza da caffeina: mantienila solo la mattina, entro le 11.');
    lines.push("Colazione proteica, esposizione alla luce nei primi 30 minuti dal risveglio, movimento facile.");
  } else if (pattern === 'Focus frammentato') {
    lines.push('Domani semplifica: una sola priorità principale al mattino, prima delle notifiche.');
    lines.push('Inserisci 5 minuti di respirazione lenta e riduci gli stimoli la sera.');
  } else if (pattern === 'Alimentazione disordinata') {
    lines.push('Domani ancora la giornata al primo pasto: proteine + una fonte di grassi buoni.');
    lines.push('Non saltare i pasti principali e riduci gli zuccheri veloci soprattutto la sera.');
  } else if (pattern === 'Routine saltata') {
    lines.push('Domani parti da una routine minima da 5 minuti al risveglio: qualcosa di realistico, non ambizioso.');
    lines.push('Meglio piccolo e ripetibile che grande e saltato.');
  } else if (pattern === 'Stress alto') {
    lines.push('Domani abbassa il carico cognitivo: meno decisioni al mattino, prepara la sera prima.');
    lines.push('Inserisci due micro-pause di respirazione lenta durante la giornata.');
  } else if (pattern === 'Buona base da mantenere') {
    lines.push('Domani ripeti quello che ha funzionato oggi, senza aggiungere complessità.');
    lines.push('Mantieni allenamento moderato, alimentazione ordinata e stessi orari di sonno.');
  } else if (pattern === 'Energia stabile') {
    lines.push('Domani consolida: stessa routine mattutina, movimento moderato, alimentazione semplice.');
  } else {
    lines.push('Domani scegli una sola area su cui lavorare: piccola, chiara, misurabile.');
  }

  if (a.natural_light === 'quasi nulla') lines.push('Aggiungi 10 minuti di luce naturale il prima possibile dopo il risveglio.');
  else if (a.natural_light === 'poca') lines.push("Prova a raddoppiare l'esposizione alla luce naturale, anche in pausa pranzo.");

  if (['anche pomeriggio', 'troppa'].includes(a.caffeine_use) && a.sleep_score <= 3) {
    lines.push('Mantieni la caffeina solo entro metà mattina per proteggere il sonno.');
  }

  if (a.improvement_area === 'sonno') lines.push("Anticipa la routine serale di 30 minuti e riduci schermi nell'ultima ora.");
  else if (a.improvement_area === 'movimento' && ['stanco', 'svuotato'].includes(a.body_feeling)) {
    lines.push('Punta su un movimento facile ma ripetibile, non su uno più intenso.');
  }

  return lines.join(' ');
}

function microAction(a: ResetInput, pattern: string): string {
  if (['Recupero insufficiente', 'Carico alto'].includes(pattern)) return 'Camminata facile di 10 minuti dopo il primo pasto.';
  if (pattern === 'Energia instabile') return 'Caffeina solo entro metà mattina, poi acqua e proteine.';
  if (pattern === 'Focus frammentato') return '5 minuti di respirazione lenta prima di iniziare la prima attività.';
  if (pattern === 'Alimentazione disordinata') return 'Cena più semplice e proteica, senza zuccheri veloci la sera.';
  if (pattern === 'Routine saltata') return 'Preparare stasera una routine minima da 5 minuti per domani mattina.';
  if (pattern === 'Stress alto') return 'Due micro-pause di respirazione lenta, una a metà mattina e una a metà pomeriggio.';
  if (a.improvement_area === 'sonno') return 'Spegnere schermi 30 minuti prima di andare a letto.';
  if (a.improvement_area === 'energia') return '10 minuti di luce naturale appena possibile al mattino.';
  if (a.improvement_area === 'movimento' && a.available_time === '5 minuti') return '5 minuti di mobilità appena alzato, senza attrezzi.';
  if (a.available_time === '5 minuti') return '5 minuti di respirazione lenta al risveglio.';
  if (a.available_time === '30 minuti') return "30 minuti di camminata all'aperto in luce naturale.";
  return '10 minuti di luce naturale appena possibile.';
}

function avoidance(a: ResetInput, pattern: string): string {
  if (['Recupero insufficiente', 'Carico alto'].includes(pattern)) return 'Non spingere con allenamento intenso se il recupero resta basso.';
  if (pattern === 'Energia instabile') return 'Non usare caffeina per coprire una stanchezza profonda: la sposta soltanto.';
  if (pattern === 'Focus frammentato') return 'Non aprire notifiche o email nella prima ora del mattino.';
  if (pattern === 'Alimentazione disordinata') return 'Non saltare i pasti principali per compensare quelli disordinati di oggi.';
  if (pattern === 'Routine saltata') return 'Non aggiungere troppe routine insieme: parti da una sola.';
  if (pattern === 'Stress alto') return 'Non aggiungere impegni non essenziali nella mattinata.';
  if (pattern === 'Buona base da mantenere') return 'Non complicare quello che sta già funzionando.';
  if (a.movement_type === 'nessuno' && ['teso', 'stanco'].includes(a.body_feeling)) return 'Non saltare completamente il movimento: riducilo, non eliminarlo.';
  return 'Non caricare la giornata di troppe intenzioni contemporaneamente.';
}

function generateReset(input: ResetInput) {
  const pattern = pickPattern(input);
  return {
    generated_pattern: pattern,
    generated_summary: summary(input, pattern),
    generated_worked: whatWorked(input),
    generated_friction: friction(input),
    generated_adjustment: adjustment(input, pattern),
    generated_micro_action: microAction(input, pattern),
    generated_avoidance: avoidance(input, pattern),
  };
}

async function getResets(): Promise<Reset[]> {
  const resets = await readJson<Reset[]>(RESETS_KEY, []);
  return [...resets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export const api = {
  async createReset(input: ResetInput): Promise<Reset> {
    const reset: Reset = {
      ...input,
      id: makeId('reset'),
      created_at: new Date().toISOString(),
      ...generateReset(input),
    };

    const existing = await getResets();
    await writeJson(RESETS_KEY, [reset, ...existing].slice(0, MAX_RESETS));
    return reset;
  },

  async listResets(): Promise<Reset[]> {
    return getResets();
  },

  async getReset(id: string): Promise<Reset> {
    const resets = await getResets();
    const reset = resets.find((item) => item.id === id);
    if (!reset) throw new Error('Reset non trovato');
    return reset;
  },

  async submitEmailLead(email: string): Promise<EmailLead> {
    const lead: EmailLead = {
      id: makeId('lead'),
      email,
      created_at: new Date().toISOString(),
    };
    const existing = await readJson<EmailLead[]>(EMAIL_LEADS_KEY, []);
    await writeJson(EMAIL_LEADS_KEY, [lead, ...existing].slice(0, 100));
    return lead;
  },
};
