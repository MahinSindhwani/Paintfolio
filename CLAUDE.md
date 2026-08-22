# Paint Portfolio

A Windows 95 MS Paint recreation that is also my portfolio. Content lives in the
canvas as fixed-size pages that look drawn in Paint. The Paint UI is the real
interface: toolbar buttons navigate, the palette recolors the site, the eraser
erases pages, closing the window drops you to a boot screen.

Stack: Vite + TypeScript, no framework, plain CSS, 98.css for base chrome.

## Rules

1. **Page content is display-only.** Block and custom pages render real,
   selectable DOM text; art pages are PNGs. Neither contains links, buttons, or
   inputs. The whole content layer is `pointer-events: none`, unconditionally.
2. **All interaction lives in the chrome** — toolbar, menu bar, status bar, title
   bar. This is what keeps hit-testing simple: the canvas hit layer owns every
   pointer event inside the well and never has to negotiate with page content.
3. **No gimmick is the only path to information.** Every effect is additive over a
   page that already reads correctly. This outranks every other rule here.
4. **No framework** (React, Vue, Svelte). If a task seems to need one, stop and say so.
5. **No new dependencies without asking.** 98.css and its webfont are the only approved ones.
6. **Every canvas mutation goes through the command stack** in `state/commands.ts`.
   If it isn't undoable it isn't done.
7. **Match `reference/paint-screenshot.png`.** Don't invent metrics — measure it,
   or state the assumption you're making.

## Build order

One item at a time. Don't start the next unprompted.

**Tier 1 — ship and deploy this before starting Tier 2**
- Static shell: 98.css + Win95 overrides, pixel-accurate to the reference
- Tool state machine, custom cursors, command stack, working pencil
- Toolbar buttons as page navigation, with the status bar showing each button's
  destination on hover
- Pages, one at a time, with the draw-in animation on navigation and on resize
- Block pages and custom pages (see "Authoring pages")
- Dev-only overlay outlining each page's authored rect, turning red on overflow
- Palette recolor via CSS custom properties
- Tab title swap on `visibilitychange`; rotating jokes in the status bar when idle
- `View > Plain`

**Tier 2** — wobbled frames and dither in the renderer; select + move tool

**Tier 3** — eraser masking; boot screen on close; art pages + the ditherer;
graffiti-on-blur

**Out of scope.** Mobile/touch, any backend, real file save/open, NES.css,
8bitcn/ui. Don't build or suggest these.

## The pixel grid

One paint pixel = 3 CSS px, as `--px: 3px`.

- Author all geometry in integer paint units, emitted as `calc(var(--px) * n)`.
  Never write a raw CSS px value for layout.
- Decoration is drawn to canvas at paint resolution and upscaled by CSS with
  `image-rendering: pixelated`. Nearest-neighbor only stays crisp at exact integer
  multiples — off-grid sizes make some upscaled pixels 3px and others 4px, which
  looks like a bug, not like retro.
- **Do not multiply canvas size by `devicePixelRatio`.** Correct for smooth
  canvas, wrong here. Draw at paint resolution; let the browser scale up.
- Text is exempt: the pixel font renders at 11px. The grid governs geometry.
- Page rects are **authored, not measured.** Each page declares a fixed
  paint-unit rect; content must fit. Nothing measures text, ever.
- **Resize changes scale, not layout.** `--px` snaps to
  `clamp(2, floor(min(vw / pageW, vh / pageH)), 6)` and the page centers in the
  well. No reflow, no ResizeObserver.

## Visual rules

Target is Windows 95, not "retro-inspired." Modern CSS defaults are all wrong here.

- 98.css is the base, but **override it toward Win95** — e.g. its title bar has a
  Win98 gradient; Win95 is flat `--title-active`. Check its output against the
  reference instead of accepting it.
- `border-radius: 0` everywhere.
- **No blur ever.** `box-shadow` only with 0 blur radius, for bevel rings. No soft
  shadows, no glows, no `filter: blur()`.
- **No smooth easing.** `steps(n, end)`, `linear` under 120ms, or a class swap.
- `-webkit-font-smoothing: none` on text. `shape-rendering="crispEdges"` on SVG.
- Custom 32×32 cursor per tool with a correct hotspot. Never `cursor: pointer`
  inside the canvas.
- Hand-drawn SVG/PNG icons at 1×. No icon fonts, no Lucide/Feather.

Raised (buttons, frame, swatches):
```css
border: 1px solid;
border-color: #dfdfdf #000 #000 #dfdfdf;
box-shadow: inset -1px -1px #808080, inset 1px 1px #fff;
```
Sunken (canvas well, status bar, pressed buttons):
```css
border: 1px solid;
border-color: #808080 #fff #fff #808080;
box-shadow: inset -1px -1px #dfdfdf, inset 1px 1px #000;
```

Tokens in `styles/tokens.css` as custom properties, so the palette tool can
rewrite them at runtime. Never hardcode a color elsewhere.
```
--px: 3px
--surface: #c0c0c0      --shadow: #808080       --title-active: #000080
--surface-light: #dfdfdf --shadow-dark: #000000  --title-inactive: #808080
--surface-white: #ffffff --canvas: #ffffff       --ink: #000000
--text: #000000          --text-inverse: #ffffff
--font: "Pixelated MS Sans Serif", "MS Sans Serif", Tahoma, sans-serif;
--font-size: 11px;
```

## Architecture

Layers inside the canvas well, bottom to top:

1. **Content** — page DOM, `pointer-events: none`
2. **Mask** — per-page `mask-image` from offscreen canvases (Tier 3, the eraser)
3. **Paint canvas** — one `<canvas>` for pencil strokes
4. **Overlay canvas** — marching ants, drag ghosts; cleared each frame
5. **Hit layer** — one transparent element receiving all pointer events

- **Pointer listeners attach once, to the hit layer.** They read the active tool
  from the store and dispatch. Never attach/detach on tool change.
- **One `requestAnimationFrame` loop** for all canvas painting, in `paint/canvas.ts`.
  Tools push to a queue; the loop draws. No tool touches a 2D context from inside
  a pointer event.
- Convert to canvas space once, at the hit layer, with `getBoundingClientRect`.
  No `clientX` past that boundary.
- Handle `getContext('2d')` returning null once at setup and throw.

## Draw-in animation

The project's one animation primitive, in `paint/animate.ts`. Runs on navigation
and on resize.

**Plot progressively; never wipe a finished bitmap.** Build an ordered list of
every plot operation for the page — all polyline points, dividers, underlines,
bullet glyphs — sorted top-to-bottom, then advance N plots per frame in the rAF
loop. Derive N from plot count and the duration budget.

Text can't be plotted per-pixel: each Block pops in, stepped and without fading,
when the plot cursor passes its top edge. Spatial sort makes this read like a
progressive bitmap load.

Art pages have no plot queue, so they reveal in horizontal bands top-to-bottom
instead — same duration budget, same interruption rules. This is closer to a real
1995 progressive bitmap load than the block path is.

Resize sequence, constants together in one place and tuned by feel:
```ts
const RESIZE_SETTLE_MS = 200;  // wait for the drag to stop
const PAINT_DELAY_MS   = 400;  // hourglass cursor + "Repainting..." in status bar
const DRAW_MS          = 500;  // plot queue drains
```
During the drag, hide page contents and show only the window outline — Windows 95
shipped with "show contents while dragging" off, so this is period-correct and
avoids the question of what to render mid-drag. The `PAINT_DELAY_MS` beat must
show the hourglass and status text; a blank pause reads as latency, not as an old
machine thinking. Keep total dead time under ~1s.

**Fully interruptible.** A resize mid-animation cancels and restarts. Guard with a
generation counter that stale rAF callbacks check and no-op against — a corner
drag fires dozens of resize events and without this they all animate at once.

Honour `prefers-reduced-motion`: render the final state instantly.

## Authoring pages

Three page kinds coexist. The chrome, tools, and animation never know which kind
they're showing — keep that boundary clean so a page can be redesigned or swapped
without touching the engine.

- **`blocks`** — content as data; the renderer styles it. The default. Text stays
  selectable.
- **`custom`** — hand-written HTML/CSS for one page. The renderer hands over an
  element and gets out of the way. Must still obey the pixel grid, the tokens, and
  the no-antialiasing rules; within that, layout is free.
- **`art`** — a hand-drawn PNG, dithered to the palette at build time. Text in it
  is pixels, not DOM.

**Blocks are absolutely positioned, not flowed.** Each block carries an optional
`at: { x, y }` in paint units. A flow-layout document doesn't feel like Paint;
placing things at chosen coordinates does, and it gives free composition without
redrawing anything. Blocks without `at` stack from the top-left.

Control over appearance, cheapest first: block variants (`frame`, `bullet`) → CSS
on the classes the renderer emits (`.pp-heading`, `.pp-entry-org`, …) → `at`
coordinates for layout → a `custom` page when nothing else fits. CSS is where most
control lives: one rule changes every page, where art would mean redrawing every
PNG.

### The renderer is a bounded module

Lives in `src/paint-page/`. Its own types, no imports reaching outside the folder,
no knowledge of my personal content. It may be extracted to its own repo later —
that must stay a `git mv`. Do not add packaging, publishing config, or a public
API surface now.

### Making pages look painted

In descending order of impact:

1. **Palette discipline.** Every color in page content comes from the tokens.
   Nothing else, ever. This matters more than all the effects below combined.
2. **Dither fills** instead of solid or gradient backgrounds:
   ```css
   background-image: conic-gradient(var(--ink) 25%, transparent 25% 50%,
                                    var(--ink) 50% 75%, transparent 75%);
   background-size: 2px 2px;
   ```
3. **Wobbled frames** drawn to an offscreen canvas at paint resolution, applied as
   `background-image` with `background-size: 100% 100%`.
4. **No antialiasing** anywhere, per the visual rules.

Pages are pixel-painted permanently — this is the steady state, not a transition.
The look comes from construction, never a post-effect: **do not apply a pixelate
filter to page content**, it destroys real text and breaks rule 1.

Frame jitter models a 1998 ball mouse, not noise — mostly straight, with occasional
1px steps that *persist*:
```ts
// rng seeded from a hash of the page id — mulberry32
let offset = 0;
for (const p of bresenham(a, b)) {
  if (rng() < 0.06) offset += rng() < 0.5 ? -1 : 1;   // step, then hold
  offset = clamp(offset, -2, 2);
  plot(p.x + perp.x * offset, p.y + perp.y * offset);
}
```
`offset` persisting across iterations rather than being recomputed per pixel is the
whole difference between hand-drawn and static. Seeding from the page id is
mandatory: unseeded jitter shimmers, and frames must regenerate identically or
pages visibly twitch on every redraw.

### Art pages (Tier 3)

Pipeline: drawing exported at its target paint-unit size → `scripts/dither.ts`
quantizes it to the palette (Floyd–Steinberg or Atkinson) → PNG in `public/art/`.
The renderer places it and scales by `--px`; nothing runs at runtime.

- The ditherer takes the palette as input, so run each source drawing once per
  palette at build time and swap PNGs when the color scheme changes. Palette
  recoloring keeps working on art pages at zero runtime cost.
- Every art page needs its text written out in `View > Plain` plus alt text. That
  is the only text version of its content.
- Detail comes from dithering, not resolution. Don't raise page dimensions to add
  detail; a small page with good dither reads richer than a large one with flat
  fills.

## Types

In `state/types.ts`. Discriminated unions; switches over them are exhaustive with a
`never` default.

```ts
type Tool = 'pencil' | 'brush' | 'eraser' | 'select' | 'fill' | 'picker' | 'text';

// Display-only. No variant may contain a link, button, or input.
// `at` is an optional paint-unit position; without it, blocks stack top-left.
type Block = { at?: Point } & (
  | { kind: 'heading'; text: string; frame?: 'box' | 'underline' }
  | { kind: 'prose'; text: string }
  | { kind: 'list'; items: string[]; bullet: 'square' | 'scribble' }
  | { kind: 'entry'; role: string; org: string; dates: string; bullets: string[] }
  | { kind: 'divider'; style: 'dashed' | 'wobble' }
);

type Page = { id: PageId; title: string; rect: Rect } & (
  | { kind: 'blocks'; blocks: Block[] }
  | { kind: 'custom'; mount: (el: HTMLElement) => void }
  | { kind: 'art'; src: string; alt: string; plain: Block[] }
);

type Command =
  | { kind: 'stroke'; tool: Tool; points: Point[]; color: string; size: number }
  | { kind: 'erase'; pageId: PageId; points: Point[]; size: number }
  | { kind: 'move'; pageId: PageId; from: Point; to: Point }
  | { kind: 'navigate'; from: PageId; to: PageId }
  | { kind: 'graffiti'; pageId: PageId; points: Point[] }
  | { kind: 'recolor'; from: Palette; to: Palette };
```

`graffiti` is tagged separately so its cleanup animation is a bulk undo of one
command kind, not a special case.

Pages are defined in `sections/data.ts`. Never write a `blocks` page as an HTML
string — that's what `custom` is for.

## Guardrails

- **The 10-second test.** Opened cold with nothing clicked, the site must convey
  who I am (CS at Memorial University, co-op at Enaimco), what I've built, and how
  to reach me. The home page draws in on load and is fully legible when it
  finishes. If this fails, fix it before any Tier 2 work.
- **Contact info must be copyable somewhere that isn't a drawing.** Pixels can't be
  selected, so it lives in the chrome — permanently in the status bar or a menu
  item — and is also printed in page content where the page is `blocks`.
- **External links live in the menu bar** (GitHub, email, resume). The toolbar is
  for page navigation only.
- **The status bar is the label mechanism.** Hover shows a button's destination;
  idle rotates jokes. Sixteen cryptic icons are not navigation by themselves.
- **`View > Plain` is mandatory, not a nicety.** For art pages it is the *only*
  text version of the content — the sole path for screen readers, search engines,
  and copying. It renders every page as an ordinary semantic document with real
  links and no chrome, using `plain` blocks for art pages.
- Toolbar buttons are real `<button>`s with accessible labels, visible focus, and
  keyboard selection.
- **Eraser strokes are never permanent** (Tier 3): they fade back after ~8s and
  navigation fully restores the page. Visitors didn't agree to destroy the content
  that's meant to sell me, and nobody discovers Ctrl+Z.
- **The boot sequence is under 3s** and exits on any key or click, with a visible
  pulsing prompt.

## File layout

```
reference/paint-screenshot.png
src/
  main.ts
  state/      types.ts  store.ts  commands.ts
  paint/      canvas.ts  pointer.ts  animate.ts  mask.ts  tools/
  paint-page/ index.ts  types.ts  render.ts  frames.ts  jitter.ts   <- bounded
  sections/   data.ts   my content only; imports paint-page, never the reverse
  chrome/     titlebar.ts  menubar.ts  toolbar.ts  palette.ts  statusbar.ts
  boot/       bootscreen.ts
  styles/     tokens.css  chrome.css  canvas.css  paint.css
scripts/dither.ts      build-time image quantizer (Tier 3)
public/art/            dithered PNGs, one per palette
```

## Working agreement

- Run `npx tsc --noEmit` after every change set; don't report done with type errors.
- Only touch files in the current item's scope. No unrequested refactors or renames.
- End each item by listing what you guessed at, what you're unsure about, and
  anything here that turned out wrong or underspecified.
- No test infrastructure yet. The command stack and jitter determinism are the two
  places worth testing — ask first.
- Prefer deleting code over adding flags. Small project; it should read like one.
