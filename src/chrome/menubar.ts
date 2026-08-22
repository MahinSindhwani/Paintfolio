import { el } from './dom';

const MENUS = ['File', 'Edit', 'View', 'Image', 'Colors', 'Help'];

export function createMenuBar(): HTMLElement {
  const items = MENUS.map((name) => {
    const item = el('span', 'menu-item');
    item.innerHTML = `<u>${name[0]}</u>${name.slice(1)}`;
    return item;
  });
  return el('div', 'menu-bar', items);
}
