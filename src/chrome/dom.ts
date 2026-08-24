/**
 * Create an HTML element with an optional class list and children.
 * Children may be elements or plain strings (strings become text nodes).
 *
 * The tag name picks the return type: createElement('button') is typed
 * as HTMLButtonElement, createElement('div') as HTMLDivElement, and so on.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.append(...children);
  return element;
}
