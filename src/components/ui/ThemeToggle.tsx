import ThemePicker from './ThemePicker'

// ============================================================
// ThemeToggle — виджет выбора темы в углу экранов входа
// ============================================================
// Раньше это была пара кнопок «Тёмная / Светлая». Тем стало шесть, поэтому
// вся логика переехала в общий ThemePicker; этот файл оставлен точкой входа,
// чтобы не трогать LoginPage / CabinetsPage / AdminPage.

export default function ThemeToggle() {
  return <ThemePicker variant="floating" />
}
