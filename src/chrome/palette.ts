import { el } from './dom';

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
  const indicator = el('div', 'color-indicator sunken', [
    el('span', 'bg'),
    el('span', 'fg'),
  ]);

  const swatches = PAINT_COLORS.map((color) => {
    const chip = el('span', 'swatch-color');
    chip.style.background = color;
    return el('span', 'swatch sunken', [chip]);
  });

  return el('div', 'color-box', [indicator, el('div', 'swatch-grid', swatches)]);
}
