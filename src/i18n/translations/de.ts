import type en from './en'

const de: Record<keyof typeof en, string> & Record<string, string> = {
  // Navigation
  'nav.home': 'Startseite',
  'nav.blog': 'Blog',
  'nav.projects': 'Projekte',
  'nav.work': 'Beruf',
  'nav.education': 'Ausbildung',
  'nav.menu': 'Men\u00FC',
  'nav.navigation': 'Navigation',

  // App list
  'filter.all': 'Alle',
  'filter.games': 'Spiele',
  'filter.tools': 'Tools',
  'filter.web': 'Web',
  'filter.misc': 'Sonstiges',
  'card.readMore': 'Weiterlesen',

  // App detail layout
  'appDetail.goToApp': 'Zur App',
  'appDetail.viewOnGithub': 'Auf GitHub ansehen',
  'appDetail.relatedBlog': 'Verwandte Blog-Beitr\u00E4ge',

  // Blog
  'blog.title': 'Blog',
  'blog.description':
    'Dokumentation meiner Lernreise. Notizen zu Patterns, Bugs und Entdeckungen.',

  // Footer
  'footer.rights': 'Alle Rechte vorbehalten.',

  // Home page - Hero
  'home.subtitle':
    'Hobby-Entwickler & Leiter Prozess Vertragsführung im Nicht-Leben Geschäft',

  // Home page - About
  'home.aboutMe': 'Über mich',
  'home.aboutP1':
    'Hobby-Entwickler, mit  grosser Begeisterung für neue Technologien und kontinuierliches Lernen zur Weiterentwicklung meiner Fähigkeiten. Derzeit mit Fokus auf Python, React und KI-Agenten.',
  'home.aboutP2':
    'Zudem agiler Leader in der Versicherungsbranche mit Leidenschaft für die Optimierung von E2E-Prozessen, kontinuierlichen Verbesserungen und Skalierung von Organisationen im SAFe-Framework. Ich befähige Teams, fördere Zusammenarbeit und ermögliche effiziente, kundenorientierte Prozesse.',

  // Home page - Work section
  'home.work': 'Beruf',
  'home.viewAllPositions': 'Alle Positionen anzeigen',
  'home.present': 'Heute',

  // Home page - Education section
  'home.education': 'Ausbildung',
  'home.viewAllEducation': 'Alle Ausbildungen anzeigen',

  // Home page - Skills section
  'home.skillsAndTech': 'Fähigkeiten & Tech Stack',
  'home.methodicalSkills': 'Methodische Fähigkeiten',
  'home.technicalSkills': 'Technische Fähigkeiten',

  // Home page - Resume entries
  'home.role.mobiliar': 'Leiter Prozess Vertragsführung',
  'home.role.performa': 'Projektleiter / Berater',
  'home.role.cvp': 'IT-Verantwortlicher',

  // SR-only labels
  'sr.company': 'Unternehmen',
  'sr.role': 'Position',
  'sr.date': 'Datum',
  'sr.institution': 'Institution',
  'sr.degree': 'Abschluss',
  'sr.dateUntil': '{{start}} bis {{end}}',

  // Projects page
  'projects.title': 'Dinge, an denen ich gearbeitet habe',
  'projects.intro': 'privat und beruflich.',

  // Education page
  'education.title': 'Ausbildung & Weiterbildung',
  'education.intro':
    'Mein akademischer Werdegang und berufliche Zertifizierungen.',
  // ZHW MDX
  'education.zhaw.degree': 'MAS Insurance Management',
  'education.zhaw.period': '2018 – 2021',

  // Work page
  'work.title': 'Berufserfahrung',
  'work.intro':
    'Mein beruflicher Werdegang von der IT-Administration über die Beratung bis zur Prozessführung in der Versicherung.',
  //Work Entries MDX
  'work.die-mobiliar.title': 'Leiter Prozess Vertragsführung',
  'work.die-mobiliar.description': 'Leitung der Abteilung Prozess Vertragsführung mit Aufgaben die Business Analyse, Führung, digitale Transformation umfassen.',
  'work.die-mobiliar.period': '2013 – Heute',

  'work.performa-ag.title': 'Projektleiter / Berater',
  'work.performa-ag.description': 'Projektmanagement und Beratung für Geschäftsprozessoptimierung und IT-Lösungen.',
  'work.performa-ag.period': '2008 – 2012',

  'work.cvp-schweiz.title': 'IT-Verantwortlicher',
  'work.cvp-schweiz.description': 'Verantwortlich für die IT-Infrastruktur und -Systeme in der nationalen Parteizentrale.',
  'work.cvp-schweiz.period': '2006 – 2008',

  // Education layout
  'education.goBack': 'Zurück zu Ausbildung',

  // Work layout
  'work.projects': 'Projekte bei {{org}}',
  'work.goBack': 'Zurück zu Beruf',

  // 404
  'notFound.title': 'Seite nicht gefunden',
  'notFound.description':
    'Die gesuchte Seite konnte leider nicht gefunden werden.',
  'notFound.goHome': 'Zur Startseite',

  // App detail titles & descriptions
  'app.tic-tac-toe.title': 'Tic Tac Toe',
  'app.tic-tac-toe.description':
    'Klassisches Zwei-Spieler-Spiel mit Zughistorie und Zeitreise. Aufgebaut nach dem offiziellen React-Tutorial.',
  'app.memory-game.title': 'Memory-Spiel',
  'app.memory-game.description':
    'Ein Karten-Memory-Spiel mit Umdreh-Animationen. Finde alle 6 passenden Paare in so wenigen Z\u00FCgen wie m\u00F6glich.',
  'app.calisthenics-progression.title': 'Calisthenics Progression',
  'app.calisthenics-progression.description':
    'Ein Full-Stack-Tracker für Calisthenics-Workouts.',
  'app.digital-handshake.title': 'Digital Handshake',
  'app.digital-handshake.description':
    'Eine pers\u00F6nliche Portfolio-Website, erstellt mit Next.js, React, TypeScript und Tailwind CSS \u2014 statisch exportiert und mit MDX-Inhalten.',
  'app.playground.title': 'Playground',
  'app.playground.description':
    'Eine React-Plattform zum Lernen, Dokumentieren und praktischen Erkunden von React-Features, Patterns und Konzepten.',
  'app.puzzle-slider.title': '15 Puzzle',
  'app.puzzle-slider.description':
    'Ein Schiebepuzzle, bei dem du 15 nummerierte Kacheln in die richtige Reihenfolge bringst, indem du benachbarte Kacheln in das leere Feld klickst.',
  'app.lazy-inviter.title': 'Lazy Inviter',
  'app.lazy-inviter.description':
    'Eine React-Web-App zum Erstellen von thematischen Geburtstagseinladungen für Kinder.',
  'app.cream.title': 'C.R.E.A.M. - eine persöliche Finanz-App',
  'app.cream.description':
    ' C.R.E.A.M. — eine persöliche Finanzverwaltungs-App für Schweizer Bankkonten und Rechnungen.',

  
  // Tic Tac Toe (solo)
  'ttt.title': 'Tic Tac Toe',
  'ttt.description':
    'Klassisches Zwei-Spieler-Spiel mit Zughistorie und Zeitreise. Erstellt nach dem offiziellen React-Tutorial.',
  'ttt.playMultiplayer': 'Multiplayer spielen',
  'ttt.winner': 'Gewinner: {{mark}}',
  'ttt.nextPlayer': 'N\u00E4chster Spieler: {{mark}}',
  'ttt.goToMove': 'Zu Zug #{{move}}',
  'ttt.restart': 'Neues Spiel',
  'ttt.moveHistory': 'Zughistorie',
  'ttt.mode': 'Modus',
  'ttt.vsPlayer': 'gegen Spieler',
  'ttt.vsComputer': 'gegen Computer',
  'ttt.difficulty': 'Schwierigkeit',
  'ttt.difficulty.easy': 'Leicht',
  'ttt.difficulty.medium': 'Mittel',
  'ttt.difficulty.hard': 'Schwer',
  'ttt.computerThinking': 'Computer denkt nach…',
  'ttt.draw': 'Unentschieden!',

  // Memory Game (solo)
  'memory.title': 'Memory',
  'memory.description':
    'Decke Karten auf und finde passende Paare. Finde alle Paare in so wenigen Z\u00FCgen wie m\u00F6glich.',
  'memory.playMultiplayer': 'Multiplayer spielen',
  'memory.moves': 'Z\u00FCge: {{count}}',
  'memory.pairs': 'Paare: {{matched}} / {{total}}',
  'memory.newGame': 'Neues Spiel',
  'memory.youWon': 'Gewonnen in {{moves}} Z\u00FCgen!',

  // Memory Game settings
  'memory.gridSize': 'Spielfeld',
  'memory.theme': 'Thema',
  'memory.grid.4x3': '4 \u00D7 3 (6 Paare)',
  'memory.grid.4x4': '4 \u00D7 4 (8 Paare)',
  'memory.grid.4x5': '4 \u00D7 5 (10 Paare)',
  'memory.grid.4x6': '4 \u00D7 6 (12 Paare)',
  'memory.theme.shapes': 'Formen',
  'memory.theme.animals': 'Tiere',
  'memory.theme.emoji': 'Emoji',
  'memory.theme.vehicles': 'Fahrzeuge',

  // Multiplayer shared
  'mp.multiplayer': 'Multiplayer',
  'mp.newRoom': 'Neuer Raum',
  'mp.creating': 'Erstelle\u2026',
  'mp.joinRoom': 'Raum beitreten',
  'mp.enterCode': 'Code eingeben',
  'mp.enterName': 'Dein Name',
  'mp.join': 'Beitreten',
  'mp.joining': 'Trete bei\u2026',
  'mp.back': '\u2190 Zur\u00FCck',
  'mp.shareCode': 'Teile diesen Code mit deinem Mitspieler',
  'mp.copied': '\u2713 Kopiert',
  'mp.copy': 'Kopieren',
  'mp.waitingForPlayer': 'Warte auf Mitspieler\u2026',
  'mp.youWin': 'Du gewinnst! \uD83C\uDF89',
  'mp.opponentWins': 'Gegner gewinnt!',
  'mp.wins': 'gewinnt!',
  'mp.draw': 'Unentschieden!',
  'mp.yourTurn': 'Dein Zug',
  'mp.opponentsTurn': '{{name}} ist dran\u2026',
  'mp.you': 'Du:',
  'mp.opponent': 'Gegner:',

  // Multiplayer errors
  'mp.error.createRoom':
    'Raum konnte nicht erstellt werden. Bitte versuche es erneut.',
  'mp.error.invalidCode': 'Bitte gib einen 6-stelligen Code ein.',
  'mp.error.roomNotFound': 'Raum nicht gefunden. \u00DCberpr\u00FCfe den Code.',
  'mp.error.wrongGame': 'Dieser Raum ist f\u00FCr ein anderes Spiel.',
  'mp.error.roomFull':
    'Dieser Raum ist bereits voll oder das Spiel hat begonnen.',
  'mp.error.joinFailed':
    'Beitreten fehlgeschlagen. Bitte versuche es erneut.',

  // Multiplayer Tic Tac Toe
  'mp.ttt.title': 'Tic Tac Toe',
  'mp.ttt.description':
    'Spiele Tic Tac Toe gegen einen Freund in Echtzeit. Erstelle einen Raum und teile den Code \u2014 oder tritt einem bestehenden Raum bei.',
  'mp.ttt.yourTurnMark': 'Dein Zug ({{mark}})',

  // Puzzle Slider
  'puzzle.title': '15-Puzzle',
  'puzzle.description':
    'Schiebe die Kacheln in die richtige Reihenfolge. Ordne die Zahlen 1\u201315 in so wenigen Z\u00FCgen und so kurzer Zeit wie m\u00F6glich.',
  'puzzle.moves': 'Z\u00FCge: {{count}}',
  'puzzle.time': 'Zeit: {{time}}',
  'puzzle.newGame': 'Neues Spiel',
  'puzzle.youWon': 'Gel\u00F6st in {{moves}} Z\u00FCgen \u2014 {{time}}! \uD83C\uDF89',

  // Multiplayer N-player
  'mp.shareCodePlayers': 'Teile diesen Code mit anderen Spielern',
  'mp.waitingForPlayers': 'Warte auf Spieler\u2026',
  'mp.playerCount': '{{current}}/{{max}} Spieler',
  'mp.startGame': 'Spiel starten',

  // Multiplayer UNO
  'mp.uno.title': 'UNO',
  'mp.uno.description':
    'Spiele UNO mit 2\u20134 Spielern online. Erstelle einen Raum und teile den Code!',

  // UNO game
  'uno.title': 'UNO',
  'uno.description':
    'Das klassische Kartenspiel. Passe Farben und Zahlen an, nutze Aktionskarten und werde als Erster alle Karten los!',
  'uno.playMultiplayer': 'Multiplayer spielen',
  'uno.yourTurn': 'Dein Zug',
  'uno.opponentsTurn': '{{name}} ist dran\u2026',
  'uno.drawCard': 'Ziehen',
  'uno.announceUno': 'UNO!',
  'uno.challengeUno': 'Anzweifeln!',
  'uno.chooseColor': 'W\u00E4hle eine Farbe',
  'uno.youWin': 'Du gewinnst! \uD83C\uDF89',
  'uno.playerWins': '{{name}} gewinnt!',
  'uno.cardsLeft': '{{count}} Karten',
  'uno.clickToPlay': 'Klicke auf eine hervorgehobene Karte, um sie zu spielen',
  'uno.direction.clockwise': 'Im Uhrzeigersinn',
  'uno.direction.counterclockwise': 'Gegen den Uhrzeigersinn',

  // Multiplayer Memory
  'mp.memory.title': 'Memory',
  'mp.memory.description':
    'Spiele Memory gegen einen Freund in Echtzeit. Finde die meisten Paare, um zu gewinnen!',
  'mp.memory.noMatch': 'Kein Paar\u2026',
  'mp.memory.moves': 'Z\u00FCge: {{count}}',
  'mp.memory.pairs': 'Paare: {{matched}}/{{total}}',

  // Header - language toggle
  'header.switchToGerman': 'Zu Deutsch wechseln',
  'header.switchToEnglish': 'Zu Englisch wechseln',
  'header.toggleLanguage': 'Sprache wechseln',

  // Header - theme toggle
  'header.switchToLight': 'Zum hellen Design wechseln',
  'header.switchToDark': 'Zum dunklen Design wechseln',
  'header.toggleTheme': 'Design wechseln',
}

export default de
