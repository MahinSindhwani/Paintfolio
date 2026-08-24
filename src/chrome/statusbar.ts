export function createStatusBar(): HTMLElement {
  const helpText = document.createElement('div');
  helpText.className = 'status-bar-field status-help';
  helpText.textContent = 'For Help, click Help Topics on the Help Menu.';

  const statusBar = document.createElement('div');
  statusBar.className = 'status-bar';
  statusBar.append(helpText, createStatusCell(), createStatusCell());
  return statusBar;
}

function createStatusCell(): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'status-bar-field status-cell';
  return cell;
}
