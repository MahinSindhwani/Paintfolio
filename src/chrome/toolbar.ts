import { createElement } from './dom';
import { pixelArtToSvg, TOOL_ICONS, type ToolIconName } from './icons';

/* Win95 Paint tool order: two columns, read left-to-right, top-to-bottom. */
const TOOLS: { icon: ToolIconName; label: string }[] = [
  { icon: 'free-select', label: 'Free-Form Select' },
  { icon: 'select', label: 'Select' },
  { icon: 'eraser', label: 'Eraser/Color Eraser' },
  { icon: 'fill', label: 'Fill With Color' },
  { icon: 'picker', label: 'Pick Color' },
  { icon: 'magnifier', label: 'Magnifier' },
  { icon: 'pencil', label: 'Pencil' },
  { icon: 'brush', label: 'Brush' },
  { icon: 'airbrush', label: 'Airbrush' },
  { icon: 'text', label: 'Text' },
  { icon: 'line', label: 'Line' },
  { icon: 'curve', label: 'Curve' },
  { icon: 'rectangle', label: 'Rectangle' },
  { icon: 'polygon', label: 'Polygon' },
  { icon: 'ellipse', label: 'Ellipse' },
  { icon: 'rounded-rectangle', label: 'Rounded Rectangle' },
];

export function createToolbar(): HTMLElement {
  const buttonGrid = createElement('div', 'tool-grid', TOOLS.map(createToolButton));
  const optionsBox = createElement('div', 'tool-options sunken');
  return createElement('div', 'tool-box', [buttonGrid, optionsBox]);
}

function createToolButton({ icon, label }: { icon: ToolIconName; label: string }): HTMLButtonElement {
  const button = createElement('button', 'tool-button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = pixelArtToSvg(TOOL_ICONS[icon]);
  return button;
}
