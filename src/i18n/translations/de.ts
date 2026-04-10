import type en from './en'

const de: Record<keyof typeof en, string> & Record<string, string> = {
  // Navigation
  'nav.home': 'Startseite',
  'nav.education': 'Ausbildung',
  'nav.projects': 'Projekte',
  'nav.work': 'Beruf',
  'nav.menu': 'Menü',
  'nav.navigation': 'Navigation',

  // Filters
  'filter.all': 'Alle',
  'card.readMore': 'Weiterlesen',

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

  // Project layout
  'project.viewLive': 'Live-Projekt ansehen',
  'project.viewGithub': 'Auf GitHub ansehen',
  'project.goBack': 'Zurück zu Projekten',

  // Education layout
  'education.goBack': 'Zurück zu Ausbildung',

  // Work layout
  'work.goBack': 'Zurück zu Beruf',

  // Not found
  'notFound.title': 'Seite nicht gefunden',
  'notFound.description':
    'Die gesuchte Seite konnte leider nicht gefunden werden.',
  'notFound.goHome': 'Zur Startseite',

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
