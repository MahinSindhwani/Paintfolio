import { getCommands, subscribeToCommands } from '../state/commands';
import { pencilStrokeToPlots } from './tools/pencil';

/* One canvas at paint resolution (1 paint px = --px CSS px), upscaled by
   CSS — never scaled by devicePixelRatio. One requestAnimationFrame loop
   owns the 2D context; tools enqueue plots and never touch it. */

export type PlotOp = { x: number; y: number; color: string };

let context: CanvasRenderingContext2D | null = null;
let canvasElement: HTMLCanvasElement | null = null;
let paintWidth = 0;
let paintHeight = 0;
let needsReplay = false;
const plotQueue: PlotOp[] = [];

export function setupPaintCanvas(elements: {
  viewport: HTMLElement;
  paper: HTMLElement;
  canvas: HTMLCanvasElement;
  hitLayer: HTMLElement;
}): void {
  const { viewport, paper, canvas, hitLayer } = elements;
  canvasElement = canvas;
  context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas context unavailable');

  const resizeToViewport = () => {
    const pxScale = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--px'),
    );
    // 6 = the viewport's 2 × 3px padding.
    const nextWidth = Math.max(1, Math.floor((viewport.clientWidth - 6) / pxScale));
    const nextHeight = Math.max(1, Math.floor((viewport.clientHeight - 6) / pxScale));
    if (nextWidth === paintWidth && nextHeight === paintHeight) return;
    paintWidth = nextWidth;
    paintHeight = nextHeight;

    // Setting width/height wipes the bitmap; the replay below repaints it.
    canvas.width = paintWidth;
    canvas.height = paintHeight;
    for (const element of [paper, canvas, hitLayer]) {
      element.style.width = `calc(var(--px) * ${paintWidth})`;
      element.style.height = `calc(var(--px) * ${paintHeight})`;
    }
    needsReplay = true;
  };

  resizeToViewport();
  window.addEventListener('resize', resizeToViewport);
  subscribeToCommands(() => {
    needsReplay = true;
  });
  requestAnimationFrame(paintFrame);
}

export function enqueuePlots(plots: PlotOp[]): void {
  plotQueue.push(...plots);
}

export function getPaintSize(): { width: number; height: number } {
  return { width: paintWidth, height: paintHeight };
}

function paintFrame(): void {
  if (!context || !canvasElement) return;

  if (needsReplay) {
    needsReplay = false;
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for (const command of getCommands()) {
      switch (command.kind) {
        case 'stroke':
          drawPlots(pencilStrokeToPlots(command.points, command.color));
          break;
        case 'erase':
        case 'move':
        case 'navigate':
        case 'graffiti':
        case 'recolor':
          break; // These paint nothing on this canvas (yet).
        default: {
          const unhandled: never = command;
          throw new Error(`unhandled command: ${JSON.stringify(unhandled)}`);
        }
      }
    }
  }

  if (plotQueue.length > 0) {
    drawPlots(plotQueue);
    plotQueue.length = 0;
  }

  requestAnimationFrame(paintFrame);
}

function drawPlots(plots: PlotOp[]): void {
  if (!context) return;
  let currentColor = '';
  for (const { x, y, color } of plots) {
    if (color !== currentColor) {
      context.fillStyle = color;
      currentColor = color;
    }
    context.fillRect(x, y, 1, 1);
  }
}
