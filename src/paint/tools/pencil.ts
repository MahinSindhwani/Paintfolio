import type { Command, Point } from '../../state/types';
import type { PlotOp } from '../canvas';

/* The stroke command stores the pointer sample points, not the plotted
   pixels — replay re-runs Bresenham between them. */

let strokePoints: Point[] | null = null;
let strokeColor = '#000000';

export function pencilStrokeBegin(point: Point, color: string): PlotOp[] {
  strokePoints = [point];
  strokeColor = color;
  return [{ x: point.x, y: point.y, color }];
}

export function pencilStrokeMove(point: Point): PlotOp[] {
  if (!strokePoints) return [];
  const last = strokePoints[strokePoints.length - 1];
  if (point.x === last.x && point.y === last.y) return [];
  strokePoints.push(point);
  return bresenhamLine(last, point).map(({ x, y }) => ({ x, y, color: strokeColor }));
}

export function pencilStrokeEnd(point: Point): { plots: PlotOp[]; command: Command } | null {
  if (!strokePoints) return null;
  const plots = pencilStrokeMove(point);
  const command: Command = {
    kind: 'stroke',
    tool: 'pencil',
    points: strokePoints,
    color: strokeColor,
    size: 1,
  };
  strokePoints = null;
  return { plots, command };
}

/* A cancelled drag still commits: its pixels are already on the canvas,
   and discarding the command would orphan them from the stack. */
export function pencilStrokeCancel(): Command | null {
  if (!strokePoints) return null;
  const command: Command = {
    kind: 'stroke',
    tool: 'pencil',
    points: strokePoints,
    color: strokeColor,
    size: 1,
  };
  strokePoints = null;
  return command;
}

export function pencilStrokeToPlots(points: Point[], color: string): PlotOp[] {
  const plots: PlotOp[] = [];
  for (let i = 0; i < points.length; i += 1) {
    if (i === 0) {
      plots.push({ x: points[0].x, y: points[0].y, color });
      continue;
    }
    for (const { x, y } of bresenhamLine(points[i - 1], points[i])) {
      plots.push({ x, y, color });
    }
  }
  return plots;
}

function bresenhamLine(from: Point, to: Point): Point[] {
  const points: Point[] = [];
  const deltaX = Math.abs(to.x - from.x);
  const deltaY = Math.abs(to.y - from.y);
  const stepX = from.x < to.x ? 1 : -1;
  const stepY = from.y < to.y ? 1 : -1;
  let error = deltaX - deltaY;
  let x = from.x;
  let y = from.y;
  for (;;) {
    points.push({ x, y });
    if (x === to.x && y === to.y) break;
    const doubledError = 2 * error;
    if (doubledError > -deltaY) {
      error -= deltaY;
      x += stepX;
    }
    if (doubledError < deltaX) {
      error += deltaX;
      y += stepY;
    }
  }
  return points;
}
