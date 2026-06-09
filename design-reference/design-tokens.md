# Design Tokens — Tazul Chess Platform

**Source:** `styles.css` + `layout.css` from Claude Design export  
**Version:** v1.0

---

## Colors

### Surfaces
```
bg-main:        #161311   /* app background */
bg-sidebar:     #14110F   /* sidebar / rails */
bg-panel:       #211C18   /* panels / inner surfaces / inputs */
bg-card:        #26211D   /* card background */
bg-card-elevated: #2F2924  /* elevated / hover state */
```

### Borders
```
border-subtle:  #3B342D   /* hairline border */
border-soft:    #2C2620   /* soft hairline */
```

### Accent — Amber
```
accent-primary: #C8A96B
accent-hover:   #D6B77A
accent-deep:    #8D6E3E
accent-ghost:   rgba(200, 169, 107, 0.10)
accent-glow:    rgba(200, 169, 107, 0.24)
```

### Semantic States
```
success:        #4E8A62
success-ghost:  rgba(78, 138, 98, 0.14)
error:          #A44D45
error-ghost:    rgba(164, 77, 69, 0.15)
warning:        #C48A41
warning-ghost:  rgba(196, 138, 65, 0.14)
info:           #6E8BAB
```

### Text
```
text-main:      #F2ECE3
text-secondary: #C1B29F
text-muted:     #8B7E72
```

### Chess Board
```
board-light:    #D7C1A0
board-dark:     #8A6A45
board-light-2:  #E2CFB2  (hover/highlight)
board-dark-2:   #99774E  (hover/highlight)
```

---

## Tailwind Config Mapping

```js
// tailwind.config.ts colors extension
colors: {
  bg: {
    main:    '#161311',
    sidebar: '#14110F',
    panel:   '#211C18',
    card:    '#26211D',
    elevated:'#2F2924',
  },
  border: {
    subtle: '#3B342D',
    soft:   '#2C2620',
  },
  amber: {
    DEFAULT:  '#C8A96B',
    bright:   '#D6B77A',
    deep:     '#8D6E3E',
    ghost:    'rgba(200,169,107,0.10)',
    glow:     'rgba(200,169,107,0.24)',
  },
  text: {
    main:      '#F2ECE3',
    secondary: '#C1B29F',
    muted:     '#8B7E72',
  },
  success:  '#4E8A62',
  error:    '#A44D45',
  warning:  '#C48A41',
  info:     '#6E8BAB',
  board: {
    light: '#D7C1A0',
    dark:  '#8A6A45',
  },
}
```

---

## Typography

### Fonts
```
display font: Inter (weight 400–900)
mono font:    JetBrains Mono (weight 400–700)
serif accent: Lora (weight 500–700) — used in some headings
```

### Scale
```
display:  56px / line-height 1.02 / weight 800 / letter-spacing -0.035em
h1:       30px / line-height 1.1  / weight 700 / letter-spacing -0.02em
h2:       22px / line-height 1.15 / weight 700 / letter-spacing -0.02em
h3:       17px / line-height 1.2  / weight 700 / letter-spacing -0.02em
body:     15px / line-height 1.5
eyebrow:  11px / weight 600 / uppercase / letter-spacing 0.14em / color text-muted
stat:     tabular-nums / weight 750 / letter-spacing -0.03em
```

---

## Spacing Scale (4px base)

```
s1:  4px
s2:  8px
s3: 12px
s4: 16px
s5: 20px
s6: 24px
s8: 32px
s10: 40px
s12: 48px
s16: 64px
```

---

## Border Radius

```
r-sm:   6px
r:     10px
r-lg:  14px
r-xl:  20px
r-full: 999px
```

---

## Shadows

```
sh-sm:   0 1px 2px rgba(0,0,0,.30)
sh:      0 4px 16px rgba(0,0,0,.30)
sh-lg:   0 14px 40px rgba(0,0,0,.40)
sh-amber: 0 0 0 1px rgba(200,169,107,.32), 0 6px 20px rgba(0,0,0,.28)
```

---

## Layout

```
sidebar-width: 232px
topbar-height: 64px
page-max-width: 1280px
page-wide-max-width: 1480px
page-padding: 28px (mobile: 18px 16px)
```

---

## Component States

### Button (amber variant)
```
default: bg #C8A96B, color #1E1812, inner shadow
hover:   bg #D6B77A, stronger shadow
active:  scale(0.97)
disabled: opacity 0.5
```

### Card hover
```
default:      border #3B342D
hover:        border rgba(200,169,107,.42), translateY(-3px), sh-amber
transition:   160ms ease
```

### Nav item active
```
bg:           rgba(200,169,107,.07)
border:       inset 0 0 0 1px rgba(200,169,107,.12)
left bar:     3px wide, bg #C8A96B, rounded right
icon color:   var(--amber)
```

### Input focus
```
border-color: #C8A96B
box-shadow:   0 0 0 3px rgba(200,169,107,0.10)
```

### Puzzle feedback correct
```
animation: pulse-correct 550ms
green glow: 0 0 0 5px rgba(78,138,98,.30)
```

### Puzzle feedback wrong
```
animation: board-shake 400ms
red glow: 0 0 0 4px rgba(164,77,69,.34)
```

---

## Motion Tokens

```
sidebar-hover:    140ms
card-hover:       160ms / 180ms
progress-fill:    700ms cubic-bezier(.2,.7,.2,1)
card-entrance:    500ms cubic-bezier(.2,.7,.2,1) — stagger 40ms
fade-in:          220ms ease
fade-up:          380ms cubic-bezier(.2,.7,.2,1)
heatmap-stagger:  400ms, each cell +4ms delay
puzzle-correct:   550ms ease
puzzle-wrong:     500ms ease (glow) + 400ms (shake)
count-up:         950ms cubic easeOut
```

---

## Scrollbar
```
width: 10px
thumb: #3a342d, 2px border, clip padding-box
thumb-hover: #4a4138
```
