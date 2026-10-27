export const colors = {
  bg: '#F4F7F5',
  surface: '#FFFFFF',
  ink: '#14231C',
  muted: '#5F7368',
  line: '#D8E4DD',
  brand: '#1A5F4A',
  brandSoft: '#E6F2ED',
  accent: '#C45C26',
  accentSoft: '#F8EDE6',
  danger: '#B42318',
  success: '#1A5F4A',
  warning: '#B54708',
};

export const memberColors = [
  '#1A5F4A',
  '#C45C26',
  '#2F5D8A',
  '#7A4E8C',
  '#8A6D1D',
  '#3D6B5A',
];

export const categories = [
  { id: 'food', emoji: '🍜' },
  { id: 'grocery', emoji: '🛒' },
  { id: 'transport', emoji: '🚇' },
  { id: 'rent', emoji: '🏠' },
  { id: 'fun', emoji: '🎬' },
  { id: 'util', emoji: '💡' },
  { id: 'medical', emoji: '💊' },
  { id: 'other', emoji: '✨' },
  { id: 'transfer', emoji: '💸' },
] as const;

export type BuiltinCategoryId = (typeof categories)[number]['id'];
