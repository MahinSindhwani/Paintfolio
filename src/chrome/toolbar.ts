/* Win95 Paint tool order: two columns, read left-to-right, top-to-bottom.
   Icons are original Win95 Paint sprites in public/icons/, one PNG each. */
const TOOLS = [
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
  const buttonGrid = document.createElement('div');
  buttonGrid.className = 'tool-grid';
  buttonGrid.append(...TOOLS.map(createToolButton));

  const optionsBox = document.createElement('div');
  optionsBox.className = 'tool-options sunken';

  const toolBox = document.createElement('div');
  toolBox.className = 'tool-box';
  toolBox.append(buttonGrid, optionsBox);
  return toolBox;
}

function createToolButton({ icon, label }: { icon: string; label: string }): HTMLButtonElement {
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
  return button;
}
