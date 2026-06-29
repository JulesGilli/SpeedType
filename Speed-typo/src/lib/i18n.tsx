import { createContext, useContext, useState, ReactNode } from 'react';
import { GameMode } from '../types/GameMode';

export type Lang = 'fr' | 'en' | 'es' | 'de' | 'it';

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

type Dict = Record<string, string>;

const fr: Dict = {
  howToPlay: 'Comment jouer',
  start: 'Commencer',
  quit: 'Quitter',
  playAgain: 'Rejouer',
  gameOver: 'Partie terminée !',
  score: 'Score',
  time: 'Temps',
  words: 'Mots',
  wpm: 'MPM',
  accuracy: 'Précision',
  combo: 'Combo',
  distance: 'Distance',
  typeThisWord: 'Tape ce mot :',
  connectGoogle: 'Se connecter avec Google',
  connected: 'Connecté :',
  logout: 'Déconnexion',
  bgAnimated: 'Fond animé',
  leaderboard: 'Classement',
  challengesMonth: 'Défis du mois',
  periodWeek: 'Semaine',
  periodMonth: 'Mois',
  periodAll: 'Tout temps',
  colPlayer: 'Joueur',
  colScore: 'Score',
  colPoints: 'Points',
  you: '(toi)',
  loading: 'Chargement…',
  serverRequired: 'Connexion au serveur requise.',
  noScoresPeriod: 'Aucun score sur cette période. Sois le premier !',
  unranked: 'Non classé',
  viewByMode: 'Par mode',
  viewGlobal: 'Global',
  colTotal: 'Total',
  colRank: 'Rang',
  tier_bronze: 'Bronze',
  tier_silver: 'Argent',
  tier_gold: 'Or',
  tier_platinum: 'Platine',
  tier_diamond: 'Diamant',
  tier_master: 'Maître',
  tier_grandmaster: 'Grand Maître',
  globalMonthlyHint: 'Classement du mois — les rangs se réinitialisent chaque mois.',
  tabChallenges: 'Défis du mois',
  tabRanking: 'Classement défis',
  yourChallengePoints: 'Tes points de défis ce mois :',
  basePoints: 'pts de base',
  validated: 'Validé',
  toDo: 'À réaliser',
  noChallengesYet: 'Les défis du mois arrivent bientôt.',
  noOneScored: 'Personne n’a encore marqué de points. À toi de jouer !',
  challengeDoneOne: 'Défi validé !',
  challengeDoneMany: 'défis validés !',
  saveSaving: 'Enregistrement du score…',
  saveSaved: 'Score enregistré dans le classement',
  saveError: 'Échec de l’enregistrement du score',
  saveAnon: 'Connecte-toi pour apparaître au classement',
  endlessHint: 'Tape le texte qui défile. Va le plus loin possible avant la fin du temps.',
  introEnter: 'pour entrer',
  introSkip: 'Entrée pour passer',
  introType: 'Tape',
  diff_facile: 'Facile',
  diff_moyen: 'Moyen',
  diff_difficile: 'Difficile',
  diff_extreme: 'Extrême',
  msg1: 'Incroyable ! Ton niveau de frappe est légendaire !',
  msg2: 'Superbe ! Tu es un·e maître de la frappe !',
  msg3: 'Excellent travail ! Ta frappe est impressionnante !',
  msg4: 'Bon effort ! Continue de t’entraîner pour progresser !',
  msg5: 'Bien tenté ! Avec de l’entraînement tu vas y arriver !',
};

const en: Dict = {
  howToPlay: 'How to play',
  start: 'Start',
  quit: 'Quit',
  playAgain: 'Play again',
  gameOver: 'Game over!',
  score: 'Score',
  time: 'Time',
  words: 'Words',
  wpm: 'WPM',
  accuracy: 'Accuracy',
  combo: 'Combo',
  distance: 'Distance',
  typeThisWord: 'Type this word:',
  connectGoogle: 'Sign in with Google',
  connected: 'Signed in:',
  logout: 'Sign out',
  bgAnimated: 'Animated background',
  leaderboard: 'Leaderboard',
  challengesMonth: 'Monthly challenges',
  periodWeek: 'Week',
  periodMonth: 'Month',
  periodAll: 'All time',
  colPlayer: 'Player',
  colScore: 'Score',
  colPoints: 'Points',
  you: '(you)',
  loading: 'Loading…',
  serverRequired: 'Server connection required.',
  noScoresPeriod: 'No score for this period. Be the first!',
  unranked: 'Unranked',
  viewByMode: 'By mode',
  viewGlobal: 'Global',
  colTotal: 'Total',
  colRank: 'Rank',
  tier_bronze: 'Bronze',
  tier_silver: 'Silver',
  tier_gold: 'Gold',
  tier_platinum: 'Platinum',
  tier_diamond: 'Diamond',
  tier_master: 'Master',
  tier_grandmaster: 'Grandmaster',
  globalMonthlyHint: 'Monthly ranking — ranks reset every month.',
  tabChallenges: 'Challenges',
  tabRanking: 'Challenge ranking',
  yourChallengePoints: 'Your challenge points this month:',
  basePoints: 'base pts',
  validated: 'Done',
  toDo: 'To do',
  noChallengesYet: 'This month’s challenges are coming soon.',
  noOneScored: 'No one has scored yet. Your turn!',
  challengeDoneOne: 'Challenge completed!',
  challengeDoneMany: 'challenges completed!',
  saveSaving: 'Saving score…',
  saveSaved: 'Score saved to the leaderboard',
  saveError: 'Failed to save the score',
  saveAnon: 'Sign in to appear on the leaderboard',
  endlessHint: 'Type the scrolling text. Go as far as you can before time runs out.',
  introEnter: 'to enter',
  introSkip: 'Enter to skip',
  introType: 'Type',
  diff_facile: 'Easy',
  diff_moyen: 'Medium',
  diff_difficile: 'Hard',
  diff_extreme: 'Extreme',
  msg1: 'Incredible! Your typing skills are legendary!',
  msg2: 'Amazing job! You are a typing master!',
  msg3: 'Great work! Your typing is impressive!',
  msg4: 'Good effort! Keep practicing to improve!',
  msg5: 'Nice try! With more practice you will get there!',
};

const es: Dict = {
  howToPlay: 'Cómo jugar',
  start: 'Empezar',
  quit: 'Salir',
  playAgain: 'Jugar de nuevo',
  gameOver: '¡Fin de la partida!',
  score: 'Puntos',
  time: 'Tiempo',
  words: 'Palabras',
  wpm: 'PPM',
  accuracy: 'Precisión',
  combo: 'Combo',
  distance: 'Distancia',
  typeThisWord: 'Escribe esta palabra:',
  connectGoogle: 'Iniciar sesión con Google',
  connected: 'Conectado:',
  logout: 'Cerrar sesión',
  bgAnimated: 'Fondo animado',
  leaderboard: 'Clasificación',
  challengesMonth: 'Retos del mes',
  periodWeek: 'Semana',
  periodMonth: 'Mes',
  periodAll: 'Histórico',
  colPlayer: 'Jugador',
  colScore: 'Puntos',
  colPoints: 'Puntos',
  you: '(tú)',
  loading: 'Cargando…',
  serverRequired: 'Se requiere conexión al servidor.',
  noScoresPeriod: 'Sin puntuaciones en este periodo. ¡Sé el primero!',
  unranked: 'Sin clasificar',
  viewByMode: 'Por modo',
  viewGlobal: 'Global',
  colTotal: 'Total',
  colRank: 'Rango',
  tier_bronze: 'Bronce',
  tier_silver: 'Plata',
  tier_gold: 'Oro',
  tier_platinum: 'Platino',
  tier_diamond: 'Diamante',
  tier_master: 'Maestro',
  tier_grandmaster: 'Gran Maestro',
  globalMonthlyHint: 'Clasificación del mes: los rangos se reinician cada mes.',
  tabChallenges: 'Retos del mes',
  tabRanking: 'Clasificación de retos',
  yourChallengePoints: 'Tus puntos de retos este mes:',
  basePoints: 'pts base',
  validated: 'Logrado',
  toDo: 'Por hacer',
  noChallengesYet: 'Los retos del mes llegan pronto.',
  noOneScored: 'Nadie ha puntuado aún. ¡Te toca!',
  challengeDoneOne: '¡Reto completado!',
  challengeDoneMany: 'retos completados!',
  saveSaving: 'Guardando puntuación…',
  saveSaved: 'Puntuación guardada en la clasificación',
  saveError: 'No se pudo guardar la puntuación',
  saveAnon: 'Inicia sesión para aparecer en la clasificación',
  endlessHint: 'Escribe el texto que se desplaza. Llega lo más lejos posible antes de que acabe el tiempo.',
  introEnter: 'para entrar',
  introSkip: 'Enter para saltar',
  introType: 'Escribe',
  diff_facile: 'Fácil',
  diff_moyen: 'Medio',
  diff_difficile: 'Difícil',
  diff_extreme: 'Extremo',
  msg1: '¡Increíble! ¡Tu nivel de escritura es legendario!',
  msg2: '¡Genial! ¡Eres un maestro del teclado!',
  msg3: '¡Buen trabajo! ¡Tu escritura es impresionante!',
  msg4: '¡Buen esfuerzo! ¡Sigue practicando para mejorar!',
  msg5: '¡Buen intento! ¡Con práctica lo conseguirás!',
};

const de: Dict = {
  howToPlay: 'So wird gespielt',
  start: 'Starten',
  quit: 'Beenden',
  playAgain: 'Nochmal spielen',
  gameOver: 'Spiel vorbei!',
  score: 'Punkte',
  time: 'Zeit',
  words: 'Wörter',
  wpm: 'WPM',
  accuracy: 'Genauigkeit',
  combo: 'Combo',
  distance: 'Distanz',
  typeThisWord: 'Tippe dieses Wort:',
  connectGoogle: 'Mit Google anmelden',
  connected: 'Angemeldet:',
  logout: 'Abmelden',
  bgAnimated: 'Animierter Hintergrund',
  leaderboard: 'Bestenliste',
  challengesMonth: 'Monats-Challenges',
  periodWeek: 'Woche',
  periodMonth: 'Monat',
  periodAll: 'Insgesamt',
  colPlayer: 'Spieler',
  colScore: 'Punkte',
  colPoints: 'Punkte',
  you: '(du)',
  loading: 'Lädt…',
  serverRequired: 'Serververbindung erforderlich.',
  noScoresPeriod: 'Keine Punkte in diesem Zeitraum. Sei der Erste!',
  unranked: 'Nicht platziert',
  viewByMode: 'Nach Modus',
  viewGlobal: 'Global',
  colTotal: 'Gesamt',
  colRank: 'Rang',
  tier_bronze: 'Bronze',
  tier_silver: 'Silber',
  tier_gold: 'Gold',
  tier_platinum: 'Platin',
  tier_diamond: 'Diamant',
  tier_master: 'Meister',
  tier_grandmaster: 'Großmeister',
  globalMonthlyHint: 'Monatsrangliste — die Ränge werden jeden Monat zurückgesetzt.',
  tabChallenges: 'Challenges',
  tabRanking: 'Challenge-Rangliste',
  yourChallengePoints: 'Deine Challenge-Punkte diesen Monat:',
  basePoints: 'Basis-Pkt',
  validated: 'Geschafft',
  toDo: 'Offen',
  noChallengesYet: 'Die Challenges des Monats kommen bald.',
  noOneScored: 'Noch niemand hat gepunktet. Du bist dran!',
  challengeDoneOne: 'Challenge geschafft!',
  challengeDoneMany: 'Challenges geschafft!',
  saveSaving: 'Punktzahl wird gespeichert…',
  saveSaved: 'Punktzahl in der Bestenliste gespeichert',
  saveError: 'Speichern der Punktzahl fehlgeschlagen',
  saveAnon: 'Melde dich an, um in der Bestenliste zu erscheinen',
  endlessHint: 'Tippe den laufenden Text. Komm so weit wie möglich, bevor die Zeit abläuft.',
  introEnter: 'zum Eintreten',
  introSkip: 'Enter zum Überspringen',
  introType: 'Tippe',
  diff_facile: 'Leicht',
  diff_moyen: 'Mittel',
  diff_difficile: 'Schwer',
  diff_extreme: 'Extrem',
  msg1: 'Unglaublich! Dein Tippniveau ist legendär!',
  msg2: 'Großartig! Du bist ein Tipp-Meister!',
  msg3: 'Tolle Arbeit! Dein Tippen ist beeindruckend!',
  msg4: 'Guter Versuch! Übe weiter, um besser zu werden!',
  msg5: 'Netter Versuch! Mit mehr Übung schaffst du es!',
};

const it: Dict = {
  howToPlay: 'Come si gioca',
  start: 'Inizia',
  quit: 'Esci',
  playAgain: 'Gioca ancora',
  gameOver: 'Partita finita!',
  score: 'Punti',
  time: 'Tempo',
  words: 'Parole',
  wpm: 'PPM',
  accuracy: 'Precisione',
  combo: 'Combo',
  distance: 'Distanza',
  typeThisWord: 'Scrivi questa parola:',
  connectGoogle: 'Accedi con Google',
  connected: 'Connesso:',
  logout: 'Esci',
  bgAnimated: 'Sfondo animato',
  leaderboard: 'Classifica',
  challengesMonth: 'Sfide del mese',
  periodWeek: 'Settimana',
  periodMonth: 'Mese',
  periodAll: 'Sempre',
  colPlayer: 'Giocatore',
  colScore: 'Punti',
  colPoints: 'Punti',
  you: '(tu)',
  loading: 'Caricamento…',
  serverRequired: 'Connessione al server richiesta.',
  noScoresPeriod: 'Nessun punteggio in questo periodo. Sii il primo!',
  unranked: 'Non classificato',
  viewByMode: 'Per modalità',
  viewGlobal: 'Globale',
  colTotal: 'Totale',
  colRank: 'Grado',
  tier_bronze: 'Bronzo',
  tier_silver: 'Argento',
  tier_gold: 'Oro',
  tier_platinum: 'Platino',
  tier_diamond: 'Diamante',
  tier_master: 'Maestro',
  tier_grandmaster: 'Gran Maestro',
  globalMonthlyHint: 'Classifica del mese — i gradi si azzerano ogni mese.',
  tabChallenges: 'Sfide del mese',
  tabRanking: 'Classifica sfide',
  yourChallengePoints: 'I tuoi punti sfida questo mese:',
  basePoints: 'pti base',
  validated: 'Completata',
  toDo: 'Da fare',
  noChallengesYet: 'Le sfide del mese arrivano presto.',
  noOneScored: 'Nessuno ha ancora segnato. Tocca a te!',
  challengeDoneOne: 'Sfida completata!',
  challengeDoneMany: 'sfide completate!',
  saveSaving: 'Salvataggio del punteggio…',
  saveSaved: 'Punteggio salvato in classifica',
  saveError: 'Salvataggio del punteggio non riuscito',
  saveAnon: 'Accedi per comparire in classifica',
  endlessHint: 'Scrivi il testo che scorre. Vai più lontano possibile prima che scada il tempo.',
  introEnter: 'per entrare',
  introSkip: 'Invio per saltare',
  introType: 'Scrivi',
  diff_facile: 'Facile',
  diff_moyen: 'Medio',
  diff_difficile: 'Difficile',
  diff_extreme: 'Estremo',
  msg1: 'Incredibile! Il tuo livello di battitura è leggendario!',
  msg2: 'Fantastico! Sei un maestro della tastiera!',
  msg3: 'Ottimo lavoro! La tua battitura è impressionante!',
  msg4: 'Buon impegno! Continua ad allenarti per migliorare!',
  msg5: 'Bel tentativo! Con la pratica ci riuscirai!',
};

const DICTS: Record<Lang, Dict> = { fr, en, es, de, it };

const MODE_LABELS: Record<Lang, Record<GameMode, string>> = {
  fr: { classique: 'Classique', inversé: 'Inversé', leet: 'Leet', memoire: 'Mémoire', blind: 'Blind', endless: 'Phrase infinie' },
  en: { classique: 'Classic', inversé: 'Reversed', leet: 'Leet', memoire: 'Memory', blind: 'Blind', endless: 'Endless' },
  es: { classique: 'Clásico', inversé: 'Invertido', leet: 'Leet', memoire: 'Memoria', blind: 'A ciegas', endless: 'Frase infinita' },
  de: { classique: 'Klassisch', inversé: 'Umgekehrt', leet: 'Leet', memoire: 'Gedächtnis', blind: 'Blind', endless: 'Endlos' },
  it: { classique: 'Classico', inversé: 'Invertito', leet: 'Leet', memoire: 'Memoria', blind: 'Alla cieca', endless: 'Frase infinita' },
};

const MODE_DESC: Record<Lang, Partial<Record<GameMode, string[]>>> = {
  fr: {
    classique: ['Tape les mots qui s’affichent à l’écran.', 'Tape vite pour enchaîner les combos et gagner plus de points !'],
    leet: ['Certains mots auront des chiffres à la place des lettres (E → 3, A → 4, etc).', 'Tape vite pour enchaîner les combos !'],
    inversé: ['Certains mots seront écrits à l’envers (ex : "monde" → "ednom").', 'Tape vite pour enchaîner les combos !'],
    memoire: ['Les mots s’affichent brièvement puis disparaissent.', 'Mémorise-les et tape-les de tête.'],
    blind: ['Tu ne verras pas ce que tu tapes.', 'Fais confiance à ta mémoire musculaire.'],
    endless: ['Un long texte défile en continu : tape-le sans t’arrêter.', 'Va le plus loin possible avant la fin — distance et MPM en direct !'],
  },
  en: {
    classique: ['Type the words shown on screen.', 'Type fast to chain combos and earn more points!'],
    leet: ['Some words swap letters for numbers (E → 3, A → 4, etc).', 'Type fast to chain combos!'],
    inversé: ['Some words are written backwards (e.g. "world" → "dlrow").', 'Type fast to chain combos!'],
    memoire: ['Words appear briefly then vanish.', 'Memorize them and type from memory.'],
    blind: ['You won’t see what you type.', 'Trust your muscle memory.'],
    endless: ['A long text scrolls endlessly: keep typing it.', 'Go as far as you can before time runs out — live distance and WPM!'],
  },
  es: {
    classique: ['Escribe las palabras que aparecen en pantalla.', '¡Escribe rápido para encadenar combos y ganar más puntos!'],
    leet: ['Algunas palabras cambian letras por números (E → 3, A → 4, etc).', '¡Escribe rápido para encadenar combos!'],
    inversé: ['Algunas palabras se escriben al revés (p. ej. "mundo" → "odnum").', '¡Escribe rápido para encadenar combos!'],
    memoire: ['Las palabras aparecen brevemente y desaparecen.', 'Memorízalas y escríbelas de memoria.'],
    blind: ['No verás lo que escribes.', 'Confía en tu memoria muscular.'],
    endless: ['Un texto largo se desplaza sin fin: sigue escribiéndolo.', '¡Llega lo más lejos posible antes de que acabe el tiempo!'],
  },
  de: {
    classique: ['Tippe die Wörter auf dem Bildschirm.', 'Tippe schnell für Combos und mehr Punkte!'],
    leet: ['Manche Wörter ersetzen Buchstaben durch Zahlen (E → 3, A → 4 usw.).', 'Tippe schnell für Combos!'],
    inversé: ['Manche Wörter sind rückwärts geschrieben (z. B. "Welt" → "tleW").', 'Tippe schnell für Combos!'],
    memoire: ['Wörter erscheinen kurz und verschwinden.', 'Merke sie dir und tippe aus dem Gedächtnis.'],
    blind: ['Du siehst nicht, was du tippst.', 'Vertraue deinem Muskelgedächtnis.'],
    endless: ['Ein langer Text läuft endlos: tippe ihn weiter.', 'Komm so weit wie möglich, bevor die Zeit abläuft!'],
  },
  it: {
    classique: ['Scrivi le parole mostrate a schermo.', 'Scrivi veloce per concatenare combo e fare più punti!'],
    leet: ['Alcune parole sostituiscono lettere con numeri (E → 3, A → 4, ecc).', 'Scrivi veloce per concatenare combo!'],
    inversé: ['Alcune parole sono scritte al contrario (es. "mondo" → "odnom").', 'Scrivi veloce per concatenare combo!'],
    memoire: ['Le parole appaiono brevemente poi spariscono.', 'Memorizzale e scrivile a memoria.'],
    blind: ['Non vedrai ciò che scrivi.', 'Fidati della tua memoria muscolare.'],
    endless: ['Un testo lungo scorre senza fine: continua a scriverlo.', 'Vai più lontano possibile prima che scada il tempo!'],
  },
};

// ---------------------------------------------------------------------------
// Défis : les titres/descriptions sont stockés en français dans la base. On les
// retraduit côté client à partir des champs structurés (goal_type/value/mode).
// Clé stable = `${goal_type}_${goal_value}_${mode ?? 'any'}` (unique par template).
// ---------------------------------------------------------------------------
const CHALLENGE_TITLES: Record<Lang, Record<string, string>> = {
  fr: {
    games_3_any: 'Échauffement', wpm_35_any: 'Petit doigté', words_25_any: 'Bavard', score_1200_classique: 'Premiers pas',
    games_1_any: 'Échauffement', wpm_25_any: 'Petit doigté', words_15_any: 'Bavard',
    score_800_classique: 'Premiers pas', wpm_40_any: 'Doigts agiles', score_2000_classique: 'Bon score',
    combo_5_any: 'Combo x5', words_30_any: 'Machine à écrire', score_1500_leet: 'Leet initié',
    wpm_60_any: 'Vitesse éclair', score_4000_classique: 'Gros score', combo_10_any: 'Combo x10',
    score_2500_inversé: 'Cerveau inversé', accuracy_95_any: 'Précision', wpm_80_any: 'Surhumain',
    accuracy_100_any: 'Sans-faute', score_6000_classique: 'Légende', combo_15_any: 'Combo démentiel',
    score_3000_memoire: "Mémoire d'éléphant",
  },
  en: {
    games_3_any: 'Warm-up', wpm_35_any: 'Light touch', words_25_any: 'Chatterbox', score_1200_classique: 'First steps',
    games_1_any: 'Warm-up', wpm_25_any: 'Light touch', words_15_any: 'Chatterbox',
    score_800_classique: 'First steps', wpm_40_any: 'Nimble fingers', score_2000_classique: 'Good score',
    combo_5_any: 'Combo x5', words_30_any: 'Typewriter', score_1500_leet: 'Leet initiate',
    wpm_60_any: 'Lightning speed', score_4000_classique: 'Big score', combo_10_any: 'Combo x10',
    score_2500_inversé: 'Reversed brain', accuracy_95_any: 'Precision', wpm_80_any: 'Superhuman',
    accuracy_100_any: 'Flawless', score_6000_classique: 'Legend', combo_15_any: 'Insane combo',
    score_3000_memoire: 'Elephant memory',
  },
  es: {
    games_3_any: 'Calentamiento', wpm_35_any: 'Toque ligero', words_25_any: 'Parlanchín', score_1200_classique: 'Primeros pasos',
    games_1_any: 'Calentamiento', wpm_25_any: 'Toque ligero', words_15_any: 'Parlanchín',
    score_800_classique: 'Primeros pasos', wpm_40_any: 'Dedos ágiles', score_2000_classique: 'Buena puntuación',
    combo_5_any: 'Combo x5', words_30_any: 'Máquina de escribir', score_1500_leet: 'Iniciado leet',
    wpm_60_any: 'Velocidad relámpago', score_4000_classique: 'Gran puntuación', combo_10_any: 'Combo x10',
    score_2500_inversé: 'Cerebro invertido', accuracy_95_any: 'Precisión', wpm_80_any: 'Sobrehumano',
    accuracy_100_any: 'Sin errores', score_6000_classique: 'Leyenda', combo_15_any: 'Combo demencial',
    score_3000_memoire: 'Memoria de elefante',
  },
  de: {
    games_3_any: 'Aufwärmen', wpm_35_any: 'Leichter Anschlag', words_25_any: 'Plappermaul', score_1200_classique: 'Erste Schritte',
    games_1_any: 'Aufwärmen', wpm_25_any: 'Leichter Anschlag', words_15_any: 'Plappermaul',
    score_800_classique: 'Erste Schritte', wpm_40_any: 'Flinke Finger', score_2000_classique: 'Gute Punktzahl',
    combo_5_any: 'Combo x5', words_30_any: 'Schreibmaschine', score_1500_leet: 'Leet-Neuling',
    wpm_60_any: 'Blitzgeschwindigkeit', score_4000_classique: 'Große Punktzahl', combo_10_any: 'Combo x10',
    score_2500_inversé: 'Umgekehrtes Hirn', accuracy_95_any: 'Präzision', wpm_80_any: 'Übermenschlich',
    accuracy_100_any: 'Fehlerfrei', score_6000_classique: 'Legende', combo_15_any: 'Wahnsinns-Combo',
    score_3000_memoire: 'Elefantengedächtnis',
  },
  it: {
    games_3_any: 'Riscaldamento', wpm_35_any: 'Tocco leggero', words_25_any: 'Chiacchierone', score_1200_classique: 'Primi passi',
    games_1_any: 'Riscaldamento', wpm_25_any: 'Tocco leggero', words_15_any: 'Chiacchierone',
    score_800_classique: 'Primi passi', wpm_40_any: 'Dita agili', score_2000_classique: 'Buon punteggio',
    combo_5_any: 'Combo x5', words_30_any: 'Macchina da scrivere', score_1500_leet: 'Iniziato leet',
    wpm_60_any: 'Velocità fulminea', score_4000_classique: 'Gran punteggio', combo_10_any: 'Combo x10',
    score_2500_inversé: 'Cervello invertito', accuracy_95_any: 'Precisione', wpm_80_any: 'Sovrumano',
    accuracy_100_any: 'Senza errori', score_6000_classique: 'Leggenda', combo_15_any: 'Combo folle',
    score_3000_memoire: "Memoria d'elefante",
  },
};

type DescFn = (v: number, mode: string) => string;
const CHALLENGE_DESC: Record<Lang, Record<string, DescFn>> = {
  fr: {
    games: (v) => `Termine ${v === 1 ? 'une partie' : `${v} parties`}`,
    wpm: (v) => `Atteins ${v} WPM dans une partie`,
    words: (v) => `Tape ${v} mots dans une partie`,
    score: (v, m) => `Marque ${v} points en ${m}`,
    combo: (v) => `Enchaîne un combo de ${v}`,
    accuracy: (v) => `Termine une partie de 20+ mots à ${v}% de précision`,
  },
  en: {
    games: (v) => `Finish ${v === 1 ? 'a game' : `${v} games`}`,
    wpm: (v) => `Reach ${v} WPM in a game`,
    words: (v) => `Type ${v} words in a game`,
    score: (v, m) => `Score ${v} points in ${m}`,
    combo: (v) => `Chain a combo of ${v}`,
    accuracy: (v) => `Finish a 20+ word game at ${v}% accuracy`,
  },
  es: {
    games: (v) => `Termina ${v === 1 ? 'una partida' : `${v} partidas`}`,
    wpm: (v) => `Alcanza ${v} PPM en una partida`,
    words: (v) => `Escribe ${v} palabras en una partida`,
    score: (v, m) => `Marca ${v} puntos en ${m}`,
    combo: (v) => `Encadena un combo de ${v}`,
    accuracy: (v) => `Termina una partida de 20+ palabras con ${v}% de precisión`,
  },
  de: {
    games: (v) => `Beende ${v === 1 ? 'ein Spiel' : `${v} Spiele`}`,
    wpm: (v) => `Erreiche ${v} WPM in einem Spiel`,
    words: (v) => `Tippe ${v} Wörter in einem Spiel`,
    score: (v, m) => `Erziele ${v} Punkte in ${m}`,
    combo: (v) => `Verkette ein Combo von ${v}`,
    accuracy: (v) => `Beende ein Spiel mit 20+ Wörtern bei ${v}% Genauigkeit`,
  },
  it: {
    games: (v) => `Completa ${v === 1 ? 'una partita' : `${v} partite`}`,
    wpm: (v) => `Raggiungi ${v} PPM in una partita`,
    words: (v) => `Scrivi ${v} parole in una partita`,
    score: (v, m) => `Segna ${v} punti in ${m}`,
    combo: (v) => `Concatena un combo di ${v}`,
    accuracy: (v) => `Completa una partita di 20+ parole al ${v}% di precisione`,
  },
};

export interface ChallengeI18nInput {
  goal_type: string;
  goal_value: number;
  mode: string | null;
}

// Les titres sont stockés en français dans la base : on inverse la table FR
// (titre français -> slug) pour retraduire un titre déjà claim (ResultScreen).
const FR_TITLE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CHALLENGE_TITLES.fr).map(([slug, title]) => [title, slug])
);

// Phrases du mode "Phrase infinie", par langue (lettres + espaces + apostrophes,
// sans accents pour une frappe fluide).
export const ENDLESS_PHRASES: Record<Lang, string[]> = {
  fr: [
    "le sigma se reveille a l'aube pour aller chercher le pain",
    'ne fais jamais confiance a un npc qui distribue du rizz gratuit',
    "le gigachad traverse l'ohio sans jamais perdre son aura",
    "chaque combo parfait remplit la salle d'une energie cosmique",
    "tape vite et laisse les mots tomber comme une pluie d'etoiles",
    "le monde entier retient son souffle jusqu'a ton prochain record",
    'skibidi toilet a encore envahi le serveur pendant la nuit',
    'garde ton calme respire et enchaine les frappes avec precision',
    "aujourd'hui c'est toi le main character alors n'abandonne pas",
    "un vrai champion n'a pas besoin de regarder ses touches",
    'le mode infini ne pardonne aucune hesitation alors reste concentre',
    "la vitesse se construit une frappe a la fois alors respecte l'effort",
  ],
  en: [
    'the sigma wakes up at five to grab the morning bread',
    "never trust an npc who's handing out free rizz",
    'the gigachad walks through ohio without losing his aura',
    'every perfect combo fills the room with cosmic energy',
    'type fast and let the words fall like a meteor shower',
    "the whole galaxy holds its breath when you're chasing a record",
    'skibidi toilet invaded the server again last night',
    'stay calm breathe and chain your keystrokes with precision',
    "a real champion doesn't look at the keys he feels the rhythm",
    "don't stop typing and don't you dare touch grass",
    'the endless mode forgives no hesitation so stay focused',
    "speed is built one keystroke at a time so don't skip the grind",
  ],
  es: [
    'el sigma se levanta a las cinco para comprar el pan',
    'nunca confies en un npc que reparte rizz gratis',
    'el gigachad cruza ohio sin perder nunca su aura',
    'cada combo perfecto llena la sala de energia cosmica',
    'escribe rapido y deja caer las palabras como meteoros',
    'toda la galaxia contiene el aliento cuando logras un record',
    'skibidi toilet invadio el servidor otra vez anoche',
    'manten la calma respira y encadena las teclas con precision',
    'tus dedos bailan en el teclado mas rapido que la luz',
    'un campeon de verdad no mira las teclas siente el ritmo',
    'el modo infinito no perdona la duda asi que concentrate',
    'la velocidad se construye tecla a tecla respeta el esfuerzo',
  ],
  de: [
    'der sigma steht um fuenf auf um brot zu holen',
    'vertraue nie einem npc der gratis rizz verteilt',
    'der gigachad geht durch ohio ohne seine aura zu verlieren',
    'jedes perfekte combo fuellt den raum mit kosmischer energie',
    'tippe schnell und lass die woerter wie meteore fallen',
    "die ganze galaxie haelt den atem an wenn's um deinen rekord geht",
    'skibidi toilet hat letzte nacht wieder den server geflutet',
    'bleib ruhig atme und reihe die tasten mit praezision aneinander',
    'deine finger tanzen schneller als das licht auf der tastatur',
    'ein echter champion schaut nie auf die tasten er fuehlt den takt',
    'der endlose modus verzeiht kein zoegern also bleib fokussiert',
    'tempo entsteht taste fuer taste also achte den grind',
  ],
  it: [
    'il sigma si sveglia alle cinque per prendere il pane',
    "non fidarti mai di un npc che regala un'aura gratis",
    'il gigachad attraversa ohio senza perdere la sua aura',
    "ogni combo perfetto riempie la stanza d'energia cosmica",
    'scrivi veloce e lascia cadere le parole come meteore',
    "tutta la galassia trattiene il fiato fino all'ultimo record",
    'skibidi toilet ha invaso il server di nuovo stanotte',
    'resta calmo respira e concatena i tasti con precisione',
    'le tue dita danzano sulla tastiera piu veloci della luce',
    'un vero campione non guarda i tasti sente il ritmo',
    "la modalita infinita non perdona l'esitazione resta concentrato",
    "la velocita si costruisce un tasto alla volta rispetta l'impegno",
  ],
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  modeLabel: (m: GameMode) => string;
  modeDesc: (m: GameMode) => string[];
  challengeText: (c: ChallengeI18nInput) => { title: string; description: string };
  challengeTitle: (frTitle: string) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

const detectLang = (): Lang => {
  const saved = localStorage.getItem('st_lang') as Lang | null;
  if (saved && DICTS[saved]) return saved;
  const nav = (navigator.language || 'en').slice(0, 2) as Lang;
  return DICTS[nav] ? nav : 'en';
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('st_lang', l);
  };

  const t = (key: string) => DICTS[lang][key] ?? en[key] ?? key;
  const modeLabel = (m: GameMode) => MODE_LABELS[lang][m] ?? m;
  const modeDesc = (m: GameMode) => MODE_DESC[lang][m] ?? MODE_DESC.en[m] ?? [];

  const challengeText = (c: ChallengeI18nInput) => {
    const slug = `${c.goal_type}_${c.goal_value}_${c.mode ?? 'any'}`;
    const title =
      CHALLENGE_TITLES[lang][slug] ?? CHALLENGE_TITLES.en[slug] ?? slug;
    const descFn =
      (CHALLENGE_DESC[lang] ?? CHALLENGE_DESC.en)[c.goal_type] ??
      CHALLENGE_DESC.en[c.goal_type];
    const description = descFn
      ? descFn(c.goal_value, c.mode ? modeLabel(c.mode as GameMode) : '')
      : '';
    return { title, description };
  };

  // Retraduit un titre de défi déjà stocké en français (liste des défis validés).
  const challengeTitle = (frTitle: string) => {
    const slug = FR_TITLE_TO_SLUG[frTitle];
    if (!slug) return frTitle;
    return CHALLENGE_TITLES[lang][slug] ?? frTitle;
  };

  return (
    <I18nContext.Provider
      value={{ lang, setLang, t, modeLabel, modeDesc, challengeText, challengeTitle }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans un <I18nProvider>');
  return ctx;
}
