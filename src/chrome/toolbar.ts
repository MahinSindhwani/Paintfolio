import { getActiveTool, setActiveTool, subscribeToStore } from '../state/store';
import type { Tool } from '../state/types';

/* Win95 Paint tool order: two columns, read left-to-right, top-to-bottom.
   Buttons without a `tool` are inert until their features land. */
const TOOLS: { icon: string; label: string; tool?: Tool }[] = [
  { icon: 'free-select', label: 'Free-Form Select' },
  { icon: 'select', label: 'Select', tool: 'select' },
  { icon: 'eraser', label: 'Eraser/Color Eraser', tool: 'eraser' },
  { icon: 'fill', label: 'Fill With Color', tool: 'fill' },
  { icon: 'picker', label: 'Pick Color', tool: 'picker' },
  { icon: 'magnifier', label: 'Magnifier' },
  { icon: 'pencil', label: 'Pencil', tool: 'pencil' },
  { icon: 'brush', label: 'Brush', tool: 'brush' },
  { icon: 'airbrush', label: 'Airbrush' },
  { icon: 'text', label: 'Text', tool: 'text' },
  { icon: 'line', label: 'Line' },
  { icon: 'curve', label: 'Curve' },
  { icon: 'rectangle', label: 'Rectangle' },
  { icon: 'polygon', label: 'Polygon' },
  { icon: 'ellipse', label: 'Ellipse' },
  { icon: 'rounded-rectangle', label: 'Rounded Rectangle' },
];

export function createToolbar(): HTMLElement {
  const toolButtons = new Map<Tool, HTMLButtonElement>();

  const buttonGrid = document.createElement('div');
  buttonGrid.className = 'tool-grid';
  for (const entry of TOOLS) {
    const button = createToolButton(entry);
    if (entry.tool) toolButtons.set(entry.tool, button);
    buttonGrid.append(button);
  }

  const styleSelectedButton = () => {
    for (const [tool, button] of toolButtons) {
      const selected = tool === getActiveTool();
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  };
  styleSelectedButton();
  subscribeToStore(styleSelectedButton);

  const optionsBox = document.createElement('div');
  optionsBox.className = 'tool-options sunken';

  const toolBox = document.createElement('div');
  toolBox.className = 'tool-box';
  toolBox.append(buttonGrid, optionsBox);
  return toolBox;
}

function createToolButton({ icon, label, tool }: { icon: string; label: string; tool?: Tool }): HTMLButtonElement {
  const image = document.createElement('img');
  image.src = `/icons/${icon}.png`;
  image.width = 16;
  image.height = 16;
  image.alt = '';
  image.draggable = false;

  const button = document.createElement('button');
  button.className = 'tool-button';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.append(image);
  if (tool) {
    button.addEventListener('click', () => setActiveTool(tool));
  }
  return button;
}
