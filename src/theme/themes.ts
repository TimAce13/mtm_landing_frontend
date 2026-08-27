// ============================================================
// Реестр тем оформления
// ============================================================
// Единственный источник правды о том, какие темы есть в продукте.
// Значения самих токенов живут в src/styles/tokens.css — здесь только
// метаданные для переключателя.
//
// Добавляя тему: (1) блок :root[data-theme="<id>"] в tokens.css со ВСЕМИ
// 41 цветовым токеном, (2) запись здесь. Незаданный токен унаследуется от
// «морской» и даст нечитаемое пятно.

export type ThemeId =
  | 'dark' | 'light'
  | 'graphite' | 'terminal' | 'paper' | 'steel'
  | 'helium' | 'contrast' | 'sepia' | 'indigo'

/** Светлая тема или тёмная — от этого зависят нативные контролы и часть правил в CSS. */
export type ThemeScheme = 'dark' | 'light'

export interface ThemeMeta {
  id:     ThemeId
  label:  string
  /** Одна строка: чем эта тема отличается. Показывается в списке. */
  hint:   string
  scheme: ThemeScheme
  /** Три цвета для образца в переключателе: фон, поверхность, акцент. */
  swatch: [string, string, string]
  /** Шрифт темы — показывается в списке, чтобы выбор был осознанным. */
  font:   string
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'dark',
    label: 'Морская',
    hint: 'Исходная тема продукта',
    scheme: 'dark',
    swatch: ['#08111B', '#112131', '#18C7C0'],
    font: 'Системный',
  },
  {
    id: 'light',
    label: 'Светлая',
    hint: 'Исходная светлая',
    scheme: 'light',
    swatch: ['#F4F7FB', '#FFFFFF', '#0D9E9A'],
    font: 'Системный',
  },
  {
    id: 'graphite',
    label: 'Графит',
    hint: 'Тёмная без синевы, плоская, янтарный акцент',
    scheme: 'dark',
    swatch: ['#101113', '#1D1F23', '#E0A458'],
    font: 'Onest',
  },
  {
    id: 'terminal',
    label: 'Терминал',
    hint: 'Плотная, почти без скруглений',
    scheme: 'dark',
    swatch: ['#0A0B0C', '#151719', '#35D07F'],
    font: 'JetBrains Mono',
  },
  {
    id: 'paper',
    label: 'Бумага',
    hint: 'Тёплая светлая, как печатный отчёт',
    scheme: 'light',
    swatch: ['#F6F3ED', '#FFFDF9', '#1F6F4A'],
    font: 'Golos Text',
  },
  {
    id: 'steel',
    label: 'Сталь',
    hint: 'Холодная светлая, как у учётных сервисов',
    scheme: 'light',
    swatch: ['#F5F6F8', '#FFFFFF', '#2F62D9'],
    font: 'IBM Plex Sans',
  },
  {
    id: 'helium',
    label: 'Helium-10',
    hint: 'Светлый контент и тёмная рейка слева — как у западных SaaS',
    scheme: 'light',
    swatch: ['#141A2A', '#FFFFFF', '#1B62F0'],
    font: 'Manrope',
  },
  {
    id: 'contrast',
    label: 'Контраст',
    hint: 'Чёрное на белом, один красный акцент, углы квадратные',
    scheme: 'light',
    swatch: ['#0A0A0A', '#FFFFFF', '#D42D1F'],
    font: 'Inter',
  },
  {
    id: 'sepia',
    label: 'Сепия',
    hint: 'Тёплая тёмная — мягче для глаз на долгой сессии',
    scheme: 'dark',
    swatch: ['#17130F', '#27211A', '#D9A441'],
    font: 'Nunito Sans',
  },
  {
    id: 'indigo',
    label: 'Индиго',
    hint: 'Сине-фиолетовая тёмная с лавандовым акцентом',
    scheme: 'dark',
    swatch: ['#0C0C14', '#1A1A2A', '#9B8CFF'],
    font: 'Rubik',
  },
]

const BY_ID = new Map(THEMES.map(t => [t.id, t]))

export const DEFAULT_THEME: ThemeId = 'dark'

/** Приводит произвольную строку из localStorage к известной теме. */
export function normalizeThemeId(value: string | null | undefined): ThemeId {
  return value && BY_ID.has(value as ThemeId) ? (value as ThemeId) : DEFAULT_THEME
}

export function themeMeta(id: ThemeId): ThemeMeta {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_THEME)!
}
