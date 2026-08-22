import { el } from './dom';
import { pixelSvg, TOOL_ICONS, type ToolIconName } from './icons';

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
  const buttons = TOOLS.map(({ icon, label }) => {
    const button = el('button', 'tool-button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = pixelSvg(TOOL_ICONS[icon]);
    return button;
  });

  const grid = el('div', 'tool-grid', buttons);
  const options = el('div', 'tool-options sunken');
  return el('div', 'tool-box', [grid, options]);
}
