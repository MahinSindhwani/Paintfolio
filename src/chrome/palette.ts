import { createElement } from './dom';

/* The 28 canonical MS Paint swatch colors, column-major to match the 2-row
   grid (dark shade above its light pair). These are future ink data for the
   drawing tools, not theme tokens — the theme lives in styles/tokens.css. */
export const PAINT_COLORS = [
  '#000000', '#ffffff',
  '#808080', '#c0c0c0',
  '#800000', '#ff0000',
  '#808000', '#ffff00',
  '#008000', '#00ff00',
  '#008080', '#00ffff',
  '#000080', '#0000ff',
  '#800080', '#ff00ff',
  '#808040', '#ffff80',
  '#004040', '#00ff80',
  '#0080ff', '#80ffff',
  '#004080', '#8080ff',
  '#8000ff', '#ff0080',
  '#804000', '#ff8040',
] as const;

export function createPalette(): HTMLElement {
  const foregroundBackgroundIndicator = createElement('div', 'color-indicator sunken', [
    createElement('span', 'bg'),
    createElement('span', 'fg'),
  ]);
  const swatchGrid = createElement('div', 'swatch-grid', PAINT_COLORS.map(createSwatch));
  return createElement('div', 'color-box', [foregroundBackgroundIndicator, swatchGrid]);
}

function createSwatch(color: string): HTMLElement {
  const colorChip = createElement('span', 'swatch-color');
  colorChip.style.background = color;
  return createElement('span', 'swatch sunken', [colorChip]);
}
