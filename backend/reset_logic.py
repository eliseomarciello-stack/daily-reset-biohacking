"""
Rule-based logic to generate the Daily Reset output from user's check-in.
All output text is in Italian.
"""
from typing import Dict, Any, List


# ---------- Helpers ----------
def _pick_pattern(a: Dict[str, Any]) -> str:
    energy = a["energy_score"]
    focus = a["focus_score"]
    stress = a["stress_score"]
    sleep = a["sleep_score"]
    movement = a["movement_type"]
    body = a["body_feeling"]
    nutrition = a["nutrition_status"]
    cravings = a["cravings_level"]
    caffeine = a["caffeine_use"]
    routine = a["routine_done"]
    available_time = a["available_time"]

    # Priority order matters: highest signal first
    if sleep <= 2 and stress >= 4:
        return "Recupero insufficiente"
    if movement == "allenamento intenso" and body == "svuotato":
        return "Carico alto"
    if energy <= 2 and caffeine == "troppa":
        return "Energia instabile"
    if focus <= 2 and stress >= 4:
        return "Focus frammentato"
    if nutrition == "molto irregolare" or cravings == "alti" or nutrition == "troppo ricca di zuccheri/carboidrati":
        return "Alimentazione disordinata"
    if routine == "no" and available_time == "5 minuti":
        return "Routine saltata"
    if stress >= 4:
        return "Stress alto"
    if energy >= 4 and stress <= 2 and sleep >= 4:
        return "Buona base da mantenere"
    if energy >= 3 and focus >= 3 and stress <= 3:
        return "Energia stabile"
    return "Giornata da consolidare"


def _summary(a: Dict[str, Any], pattern: str) -> str:
    energy = a["energy_score"]
    focus = a["focus_score"]
    stress = a["stress_score"]
    sleep = a["sleep_score"]

    parts: List[str] = []

    # Opening tone based on the pattern
    openings = {
        "Recupero insufficiente": "Oggi la giornata sembra essere stata più pesante sul piano nervoso che fisico.",
        "Carico alto": "Oggi il corpo ha lavorato tanto e sta chiedendo di rallentare.",
        "Energia instabile": "Oggi l'energia è rimasta bassa e la caffeina non è riuscita a compensare.",
        "Focus frammentato": "Oggi la mente è rimasta dispersa e lo stress ha frammentato l'attenzione.",
        "Alimentazione disordinata": "Oggi l'alimentazione è stata il fattore più rumoroso della giornata.",
        "Routine saltata": "Oggi è saltata la routine e il resto della giornata ne ha risentito.",
        "Stress alto": "Oggi lo stress ha avuto un peso maggiore dell'energia o del recupero.",
        "Buona base da mantenere": "Oggi la giornata sembra essere andata bene senza sforzi eccessivi.",
        "Energia stabile": "Oggi energia e focus si sono retti su una base stabile.",
        "Giornata da consolidare": "Oggi è stata una giornata media, senza picchi né crolli evidenti.",
    }
    parts.append(openings.get(pattern, openings["Giornata da consolidare"]))

    # Body of the summary
    if energy <= 2:
        parts.append("L'energia è stata bassa per gran parte del tempo.")
    elif energy >= 4:
        parts.append("L'energia è rimasta buona.")

    if focus <= 2:
        parts.append("Il focus ha faticato a mantenersi.")
    elif focus >= 4:
        parts.append("Il focus è stato solido.")

    if stress >= 4:
        parts.append("Lo stress si è fatto sentire in modo evidente.")
    elif stress <= 2:
        parts.append("Lo stress è rimasto contenuto.")

    if sleep <= 2:
        parts.append("Il sonno della notte prima non ha aiutato.")
    elif sleep >= 4:
        parts.append("Il sonno ha dato una base di recupero solida.")

    # Closing suggestion
    if pattern in ("Recupero insufficiente", "Carico alto", "Stress alto"):
        parts.append("Domani conviene semplificare, non aggiungere.")
    elif pattern == "Buona base da mantenere":
        parts.append("Domani basta ripetere quello che ha funzionato oggi.")
    else:
        parts.append("Domani un piccolo aggiustamento può cambiare la traiettoria della giornata.")

    return " ".join(parts)


def _what_worked(a: Dict[str, Any]) -> str:
    if a["sleep_score"] >= 4:
        return "Il sonno della notte scorsa ha dato una buona base di partenza."
    if a["energy_score"] >= 4:
        return "L'energia è rimasta abbastanza stabile durante la giornata."
    if a["focus_score"] >= 4:
        return "Il focus ha tenuto meglio del previsto, nonostante il resto."
    if a["natural_light"] == "sì, buona":
        return "L'esposizione alla luce naturale ha aiutato più di quanto sembri."
    if a["movement_type"] in ("camminata leggera", "allenamento leggero"):
        return "Un movimento leggero è stato una scelta intelligente per la giornata."
    if a["routine_done"] == "sì":
        return "Aver mantenuto una routine, anche piccola, ha fatto da ancora."
    if a["routine_done"] == "parzialmente":
        return "Anche una routine parziale ha tenuto un minimo di continuità."
    if a["stress_score"] <= 2:
        return "Lo stress basso è stato una risorsa da non sottovalutare."
    return "Essere qui a fare il check-in è già un segnale di consapevolezza."


def _friction(a: Dict[str, Any]) -> str:
    if a["sleep_score"] <= 2 and a["stress_score"] >= 4:
        return "Poco sonno unito ad alto stress ha creato la frizione principale."
    if a["caffeine_use"] == "troppa":
        return "L'eccesso di caffeina ha probabilmente peggiorato ansia e recupero."
    if a["nutrition_status"] == "molto irregolare":
        return "Un'alimentazione molto irregolare ha destabilizzato energia e umore."
    if a["nutrition_status"] == "troppo ricca di zuccheri/carboidrati":
        return "Troppi zuccheri e carboidrati veloci hanno creato picchi e crolli."
    if a["nutrition_status"] == "pesante":
        return "Un'alimentazione pesante ha rallentato la digestione e il focus."
    if a["cravings_level"] == "alti":
        return "Craving alti indicano che qualcosa nell'alimentazione o nel sonno non ha tenuto."
    if a["movement_type"] == "allenamento intenso" and a["body_feeling"] == "svuotato":
        return "Un allenamento intenso su una base scarica ha svuotato le riserve."
    if a["natural_light"] in ("poca", "quasi nulla"):
        return "Poca luce naturale ha reso più difficile regolare energia e ritmo."
    if a["stress_score"] >= 4:
        return "Lo stress percepito ha assorbito più risorse del necessario."
    if a["routine_done"] == "no":
        return "Saltare del tutto la routine ha tolto un punto d'appoggio alla giornata."
    return "Nessun singolo elemento critico, ma diversi piccoli attriti hanno pesato insieme."


def _adjustment(a: Dict[str, Any], pattern: str) -> str:
    lines: List[str] = []

    if pattern == "Recupero insufficiente":
        lines.append("Domani punta sul recupero: routine leggera, cena semplice e proteica, luce naturale la mattina.")
        lines.append("Evita allenamenti intensi e riduci la caffeina, soprattutto nel pomeriggio.")
    elif pattern == "Carico alto":
        lines.append("Domani metti il corpo in modalità recupero: camminata facile, mobilità o riposo attivo.")
        lines.append("Priorità a idratazione, proteine e sonno anticipato di 20-30 minuti.")
    elif pattern == "Energia instabile":
        lines.append("Domani riduci la dipendenza da caffeina: mantienila solo la mattina, entro le 11.")
        lines.append("Colazione proteica, esposizione alla luce nei primi 30 minuti dal risveglio, movimento facile.")
    elif pattern == "Focus frammentato":
        lines.append("Domani semplifica: una sola priorità principale al mattino, prima delle notifiche.")
        lines.append("Inserisci 5 minuti di respirazione lenta e riduci gli stimoli la sera.")
    elif pattern == "Alimentazione disordinata":
        lines.append("Domani ancora la giornata al primo pasto: proteine + una fonte di grassi buoni.")
        lines.append("Non saltare i pasti principali e riduci gli zuccheri veloci soprattutto la sera.")
    elif pattern == "Routine saltata":
        lines.append("Domani parti da una routine minima da 5 minuti al risveglio: qualcosa di realistico, non ambizioso.")
        lines.append("Meglio piccolo e ripetibile che grande e saltato.")
    elif pattern == "Stress alto":
        lines.append("Domani abbassa il carico cognitivo: meno decisioni al mattino, prepara la sera prima.")
        lines.append("Inserisci due micro-pause di respirazione lenta durante la giornata.")
    elif pattern == "Buona base da mantenere":
        lines.append("Domani ripeti quello che ha funzionato oggi, senza aggiungere complessità.")
        lines.append("Mantieni allenamento moderato, alimentazione ordinata e stessi orari di sonno.")
    elif pattern == "Energia stabile":
        lines.append("Domani consolida: stessa routine mattutina, movimento moderato, alimentazione semplice.")
    else:
        lines.append("Domani scegli una sola area su cui lavorare: piccola, chiara, misurabile.")

    # Add-ons based on specific answers
    if a["natural_light"] == "quasi nulla":
        lines.append("Aggiungi 10 minuti di luce naturale il prima possibile dopo il risveglio.")
    elif a["natural_light"] == "poca":
        lines.append("Prova a raddoppiare l'esposizione alla luce naturale, anche in pausa pranzo.")

    if a["caffeine_use"] in ("anche pomeriggio", "troppa") and a["sleep_score"] <= 3:
        lines.append("Mantieni la caffeina solo entro metà mattina per proteggere il sonno.")

    if a["improvement_area"] == "sonno":
        lines.append("Anticipa la routine serale di 30 minuti e riduci schermi nell'ultima ora.")
    elif a["improvement_area"] == "movimento" and a["body_feeling"] in ("stanco", "svuotato"):
        lines.append("Punta su un movimento facile ma ripetibile, non su uno più intenso.")

    return " ".join(lines)


def _micro_action(a: Dict[str, Any], pattern: str) -> str:
    time = a["available_time"]
    area = a["improvement_area"]

    if pattern in ("Recupero insufficiente", "Carico alto"):
        return "Camminata facile di 10 minuti dopo il primo pasto."
    if pattern == "Energia instabile":
        return "Caffeina solo entro metà mattina, poi acqua e proteine."
    if pattern == "Focus frammentato":
        return "5 minuti di respirazione lenta prima di iniziare la prima attività."
    if pattern == "Alimentazione disordinata":
        return "Cena più semplice e proteica, senza zuccheri veloci la sera."
    if pattern == "Routine saltata":
        return "Preparare stasera una routine minima da 5 minuti per domani mattina."
    if pattern == "Stress alto":
        return "Due micro-pause di respirazione lenta, una a metà mattina e una a metà pomeriggio."
    if area == "sonno":
        return "Spegnere schermi 30 minuti prima di andare a letto."
    if area == "energia":
        return "10 minuti di luce naturale appena possibile al mattino."
    if area == "movimento" and time == "5 minuti":
        return "5 minuti di mobilità appena alzato, senza attrezzi."
    if time == "5 minuti":
        return "5 minuti di respirazione lenta al risveglio."
    if time == "30 minuti":
        return "30 minuti di camminata all'aperto in luce naturale."
    return "10 minuti di luce naturale appena possibile."


def _avoidance(a: Dict[str, Any], pattern: str) -> str:
    if pattern in ("Recupero insufficiente", "Carico alto"):
        return "Non spingere con allenamento intenso se il recupero resta basso."
    if pattern == "Energia instabile":
        return "Non usare caffeina per coprire una stanchezza profonda: la sposta soltanto."
    if pattern == "Focus frammentato":
        return "Non aprire notifiche o email nella prima ora del mattino."
    if pattern == "Alimentazione disordinata":
        return "Non saltare i pasti principali per compensare quelli disordinati di oggi."
    if pattern == "Routine saltata":
        return "Non aggiungere troppe routine insieme: parti da una sola."
    if pattern == "Stress alto":
        return "Non aggiungere impegni non essenziali nella mattinata."
    if pattern == "Buona base da mantenere":
        return "Non complicare quello che sta già funzionando."
    if a["movement_type"] == "nessuno" and a["body_feeling"] in ("teso", "stanco"):
        return "Non saltare completamente il movimento: riducilo, non eliminarlo."
    return "Non caricare la giornata di troppe intenzioni contemporaneamente."


def generate_reset(a: Dict[str, Any]) -> Dict[str, str]:
    pattern = _pick_pattern(a)
    return {
        "generated_pattern": pattern,
        "generated_summary": _summary(a, pattern),
        "generated_worked": _what_worked(a),
        "generated_friction": _friction(a),
        "generated_adjustment": _adjustment(a, pattern),
        "generated_micro_action": _micro_action(a, pattern),
        "generated_avoidance": _avoidance(a, pattern),
    }
