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

  // Work page
  'work.title': 'Berufserfahrung',
  'work.intro':
    'Mein beruflicher Werdegang von der IT-Administration über die Beratung bis zur Prozessführung in der Versicherung.',
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
  'mp.cleanupNotice': 'Inaktive Räume werden nach einigen Stunden automatisch gelöscht.',
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

  // Multiplayer Cipher Cards
  'mp.cipher.title': 'Cipher Cards',
  'mp.cipher.description':
    'Zwei Teams, ein geheimer Schl\u00fcssel. Die Spymaster geben Ein-Wort-Hinweise, die Agenten finden ihre Karten. Ab 4 Spielern.',
  'mp.cipher.teamRed': 'Rotes Team',
  'mp.cipher.teamBlue': 'Blaues Team',
  'mp.cipher.spymaster': 'Spymaster',
  'mp.cipher.operatives': 'Agenten',
  'mp.cipher.takeSeat': 'Beitreten',
  'mp.cipher.leaveSeat': 'Platz verlassen',
  'mp.cipher.unassigned': 'Ohne Platz',
  'mp.cipher.needTeams':
    'Jedes Team braucht einen Spymaster und mindestens einen Agenten.',
  'mp.cipher.waitHost': 'Warte auf den Host\u2026',
  'mp.cipher.clue': 'Hinweis',
  'mp.cipher.clueWord': 'Hinweis (ein Wort)',
  'mp.cipher.clueCount': 'Anzahl Karten',
  'mp.cipher.giveClue': 'Hinweis geben',
  'mp.cipher.guessesLeft': 'noch {{n}} Versuche',
  'mp.cipher.endTurn': 'Zug beenden',
  'mp.cipher.rematch': 'Nochmal spielen',
  'mp.cipher.giveClueHint': 'Gib deinem Team einen Ein-Wort-Hinweis',
  'mp.cipher.waitingClue': 'Warte auf den Hinweis vom {{team}}\u2026',
  'mp.cipher.yourGuess': 'W\u00e4hle eine Karte',
  'mp.cipher.teamGuessing': 'Das {{team}} r\u00e4t\u2026',
  'mp.cipher.winner': '{{team}} gewinnt!',
  'mp.cipher.winnerAssassin': '{{team}} gewinnt \u2013 das andere Team hat den Attent\u00e4ter erwischt!',
  'mp.cipher.rules.title': 'Spielanleitung',
  'mp.cipher.rules.intro':
    'Zwei Teams wetteifern darum, auf einem Feld mit 25 Wörtern alle ihre Geheimagenten zu finden. Nur eine Person pro Team weiss, wo sie liegen, und darf pro Runde nur mit einem einzigen Wort helfen.',
  'mp.cipher.rules.boardAlt': 'Beispiel einer Schlüsselkarte: ein 5x5-Raster aus roten, blauen, beigen und schwarzen Feldern',
  'mp.cipher.rules.legend.start': 'Startteam: 9 Karten',
  'mp.cipher.rules.legend.other': 'Anderes Team: 8 Karten',
  'mp.cipher.rules.legend.neutral': 'Unbeteiligte: 7 Karten',
  'mp.cipher.rules.legend.assassin': 'Attentäter: 1 Karte',
  'mp.cipher.rules.setup.title': 'Vorbereitung',
  'mp.cipher.rules.setup.1':
    'Bildet zwei Teams (Rot und Blau), möglichst gleich gross. Jedes Team bestimmt einen Spymaster, alle anderen sind Agenten. Ihr braucht mindestens 4 Spieler.',
  'mp.cipher.rules.setup.2':
    'Auf dem Feld liegen 25 Wörter. Nur die beiden Spymaster sehen die geheime Schlüsselkarte, die verrät, wem welches Wort gehört (Beispiel unten). Das Startteam muss 9 Wörter finden, das andere Team 8. Wer beginnt, wird zufällig bestimmt.',
  'mp.cipher.rules.turn.title': 'Eine Runde',
  'mp.cipher.rules.turn.1':
    'Der Spymaster des aktiven Teams gibt einen Hinweis: ein Wort und eine Zahl. Die Zahl sagt dem Team, wie viele Wörter auf dem Feld zu diesem Hinweis passen.',
  'mp.cipher.rules.turn.2':
    'Die Agenten beraten sich und tippen dann ein Wort an. Was passiert, hängt davon ab, wem die Karte gehört:',
  'mp.cipher.rules.outcome.own':
    'Eine Karte des eigenen Teams: Sie wird in eurer Farbe aufgedeckt und ihr dürft weiterraten.',
  'mp.cipher.rules.outcome.neutral': 'Ein Unbeteiligter: Eure Runde ist zu Ende.',
  'mp.cipher.rules.outcome.enemy':
    'Eine Karte des anderen Teams: Eure Runde ist zu Ende und die Karte zählt jetzt für das andere Team.',
  'mp.cipher.rules.outcome.assassin': 'Der Attentäter: Euer Team hat sofort verloren.',
  'mp.cipher.rules.clue.title': 'Was ein guter Hinweis ist',
  'mp.cipher.rules.clue.1':
    'Ein Hinweis ist genau ein Wort. Keine zusätzlichen Tipps, keine Sätze, keine Erklärungen.',
  'mp.cipher.rules.clue.2':
    'Er muss sich auf die Bedeutung beziehen. Nicht erlaubt sind Hinweise auf Buchstaben, die Anzahl Buchstaben oder die Lage eines Wortes auf dem Feld.',
  'mp.cipher.rules.clue.3':
    'Er darf kein Wort sein, das noch auf dem Feld liegt, und auch kein Teil davon (die App prüft das genaue Wort). Ist eine Karte aufgedeckt, darf ihr Wort wieder benutzt werden.',
  'mp.cipher.rules.clue.4':
    'Eigennamen, zusammengesetzte Wörter und Reime sind Grauzonen. Einigt euch vor dem Start, wie streng ihr sein wollt. Wörter, die gleich klingen, aber etwas anderes bedeuten, gelten als verschiedene Wörter.',
  'mp.cipher.rules.clue.5':
    'Spymaster behalten ein Pokerface: keine Hinweise durch Blicke, Gesten oder Reaktionen, während das Team berät. Die Agenten sollten nicht auf den Spymaster schauen.',
  'mp.cipher.rules.guess.title': 'Anzahl Rateversuche',
  'mp.cipher.rules.guess.1':
    'Das Team muss mindestens einmal raten. Ein falscher Tipp beendet die Runde sofort, ein richtiger erlaubt weiterzuraten.',
  'mp.cipher.rules.guess.2':
    'Höchstens so viele Karten wie die Hinweiszahl plus eins dürfen getippt werden. Der Zusatzversuch ist für eine Karte eines früheren Hinweises gedacht, die noch offen ist. Ihr könnt auch früher mit «Zug beenden» aufhören.',
  'mp.cipher.rules.guess.3':
    'Hinweiszahl 0 (hier als 0 / ∞ angezeigt) heisst: Keine eurer Karten passt zu diesem Wort, haltet euch davon fern. Das Team darf dann beliebig oft raten, mindestens aber einmal. Praktisch auch, um alte offene Hinweise nachzuholen.',
  'mp.cipher.rules.end.title': 'Spielende',
  'mp.cipher.rules.end.1':
    'Das Team, das zuerst alle seine Karten aufgedeckt hat, gewinnt. Das kann auch in der Runde des anderen Teams passieren, wenn es eure letzte Karte antippt.',
  'mp.cipher.rules.end.2':
    'Deckt ein Team den Attentäter auf, endet das Spiel sofort und das andere Team gewinnt.',
  'mp.cipher.rules.tips.title': 'Tipps',
  'mp.cipher.rules.tips.1':
    'Spymaster: Gib einen Hinweis nur, wenn du sicher bist, dass er nicht zum Attentäter führt. Ein kleiner, sicherer Hinweis ist besser als ein riskanter grosser.',
  'mp.cipher.rules.tips.2':
    'Agenten: Überlegt, auf welche anderen Wörter der Hinweis noch passen könnte, vor allem auf den Attentäter und die Karten des anderen Teams.',
  'mp.cipher.rules.tips.3':
    'Die App erzwingt nur die Grundregeln (ein Wort, kein Wort vom Feld). Alles andere beruht auf Vertrauen. Nutzt den Teamchat, den nur dein eigenes Team (inklusive Spymaster) lesen kann, oder sprecht miteinander, vor Ort oder im Anruf. Spymaster können nur mitlesen, solange ihr Team rät.',
  'mp.cipher.rules.credit':
    'Cipher Cards ist vom Brettspiel Codenames von Vlaada Chvátil (Czech Games Edition) inspiriert. Es ist ein unabhängiges, nicht kommerzielles Projekt und steht in keiner Verbindung zum Verlag.',
  'mp.cipher.chat.title': 'Teamchat \u2013 {{team}}',
  'mp.cipher.chat.private': 'Nur dein Team kann das lesen.',
  'mp.cipher.chat.empty': 'Noch keine Nachrichten. Besprecht, welche Karten zum Hinweis passen.',
  'mp.cipher.chat.placeholder': 'Schreib deinem Team\u2026',
  'mp.cipher.chat.send': 'Senden',
  'mp.cipher.chat.locked':
    'Als Spymaster kannst du mitlesen, aber nicht schreiben, solange dein Team r\u00e4t.',
  'mp.cipher.chat.invalid': 'Bitte schreibe eine Nachricht mit h\u00f6chstens 300 Zeichen.',
  'mp.cipher.error.generic': 'Etwas ist schiefgelaufen. Bitte versuche es nochmal.',
  'mp.cipher.error.spymasterTaken': 'Dieses Team hat schon einen Spymaster.',
  'mp.cipher.error.clueOnBoard': 'Der Hinweis darf kein Wort auf dem Spielfeld sein.',
  'mp.cipher.error.invalidClue': 'Bitte gib genau ein Wort ein.',
  'mp.cipher.error.teamsIncomplete':
    'Jedes Team braucht einen Spymaster und mindestens einen Agenten.',

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
