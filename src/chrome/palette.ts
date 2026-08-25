/* The 28 canonical MS Paint swatch colors, column-major to match the 2-row
   grid. Ink data for the drawing tools, not theme tokens — the theme lives
   in styles/tokens.css. */
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
  const swatchGrid = document.createElement('div');
  swatchGrid.className = 'swatch-grid';
  swatchGrid.append(...PAINT_COLORS.map(createSwatch));

  const colorBox = document.createElement('div');
  colorBox.className = 'color-box';
  colorBox.append(createForegroundBackgroundIndicator(), swatchGrid);
  return colorBox;
}

function createForegroundBackgroundIndicator(): HTMLElement {
  const backgroundSquare = document.createElement('span');
  backgroundSquare.className = 'bg';

  const foregroundSquare = document.createElement('span');
  foregroundSquare.className = 'fg';

  const indicator = document.createElement('div');
  indicator.className = 'color-indicator sunken';
  indicator.append(backgroundSquare, foregroundSquare);
  return indicator;
}

function createSwatch(color: string): HTMLElement {
  const colorChip = document.createElement('span');
  colorChip.className = 'swatch-color';
  colorChip.style.background = color;

  const swatch = document.createElement('span');
  swatch.className = 'swatch sunken';
  swatch.append(colorChip);
  return swatch;
}
