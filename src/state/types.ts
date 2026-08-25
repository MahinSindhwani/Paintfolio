/* Switches over these unions must be exhaustive with a never default. */

export type Tool = 'pencil' | 'brush' | 'eraser' | 'select' | 'fill' | 'picker' | 'text';

/** Integer paint units. */
export type Point = { x: number; y: number };

/** Paint units. */
export type Rect = { x: number; y: number; w: number; h: number };

/** Narrows to a literal union when pages land (Tier 1 item 4). */
export type PageId = string;

/** Token name → color. */
export type Palette = Record<string, string>;

// Display-only. No variant may contain a link, button, or input.
// `at` is an optional paint-unit position; without it, blocks stack top-left.
export type Block = { at?: Point } & (
  | { kind: 'heading'; text: string; frame?: 'box' | 'underline' }
  | { kind: 'prose'; text: string }
  | { kind: 'list'; items: string[]; bullet: 'square' | 'scribble' }
  | { kind: 'entry'; role: string; org: string; dates: string; bullets: string[] }
  | { kind: 'divider'; style: 'dashed' | 'wobble' }
);

export type Page = { id: PageId; title: string; rect: Rect } & (
  | { kind: 'blocks'; blocks: Block[] }
  | { kind: 'custom'; mount: (el: HTMLElement) => void }
  | { kind: 'art'; src: string; alt: string; plain: Block[] }
);

export type Command =
  | { kind: 'stroke'; tool: Tool; points: Point[]; color: string; size: number }
  | { kind: 'erase'; pageId: PageId; points: Point[]; size: number }
  | { kind: 'move'; pageId: PageId; from: Point; to: Point }
  | { kind: 'navigate'; from: PageId; to: PageId }
  | { kind: 'graffiti'; pageId: PageId; points: Point[] }
  | { kind: 'recolor'; from: Palette; to: Palette };
