const MENU_TITLES = ['File', 'Edit', 'View', 'Image', 'Colors', 'Help'];

export function createMenuBar(): HTMLElement {
  const menuBar = document.createElement('div');
  menuBar.className = 'menu-bar';
  menuBar.append(...MENU_TITLES.map(createMenuItem));
  return menuBar;
}

/* Win95 menus underline their access key — the first letter, for all of ours. */
function createMenuItem(title: string): HTMLElement {
  const item = document.createElement('span');
  item.className = 'menu-item';
  item.innerHTML = `<u>${title[0]}</u>${title.slice(1)}`;
  return item;
}
