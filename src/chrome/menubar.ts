import { createElement } from './dom';

const MENU_TITLES = ['File', 'Edit', 'View', 'Image', 'Colors', 'Help'];

export function createMenuBar(): HTMLElement {
  return createElement('div', 'menu-bar', MENU_TITLES.map(createMenuItem));
}

/* Win95 menus underline their access key — the first letter, for all of ours. */
function createMenuItem(title: string): HTMLElement {
  const item = createElement('span', 'menu-item');
  item.innerHTML = `<u>${title[0]}</u>${title.slice(1)}`;
  return item;
}
