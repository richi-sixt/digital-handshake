import type en from './en'

const de: Record<keyof typeof en, string> & Record<string, string> = {
  // Navigation
  'nav.home': 'Startseite',
  'nav.education': 'Ausbildung',
  'nav.projects': 'Projekte',
  'nav.work': 'Beruf',
  'nav.menu': 'Men\u00FC',
  'nav.navigation': 'Navigation',

  // Filters
  'filter.all': 'Alle',
  'card.readMore': 'Weiterlesen',

  // Footer
  'footer.rights': 'Alle Rechte vorbehalten.',
}

export default de
