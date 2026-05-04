# Cedar Training Center — Next.js Redesign

Drop these files into your existing `cedar-project` to replace the marketing pages with the new design.

## What's included

```
app/
  globals.css                          ← Replace existing globals.css
  layout.tsx                           ← Root layout (fonts: Syne + DM Sans)
  (marketing)/
    layout.tsx                         ← Marketing layout (Nav + Footer, lang state)
    page.tsx                           ← Homepage
    about/page.tsx                     ← About page
    courses/page.tsx                   ← Programs page
    contact/page.tsx                   ← Contact page
    register/page.tsx                  ← Registration wizard (3 steps)

components/
  marketing/
    PublicNav.tsx                      ← Nav with EN/FR toggle
    PublicFooter.tsx                   ← Footer
    HomePage.tsx                       ← Homepage component (client, with animations)
```

## Installation

1. **Copy files** into your `cedar-project/` matching the folder structure above.

2. **Install fonts** — already using `next/font/google` in `layout.tsx`:
   ```ts
   import { Syne, DM_Sans } from "next/font/google";
   ```
   No extra packages needed.

3. **CSS variables** — `globals.css` defines all color tokens:
   ```css
   --green: #2ea82a;
   --green-dark: #1a6b18;
   --green-deep: #0f4a0d;
   --mint: #e8f7e8;
   /* ... */
   ```

4. **Translations** — The marketing layout currently uses a `lang` state passed as props.
   To connect to your existing `next-intl` setup, replace the `lang` prop pattern with
   `useTranslations()` hooks and move string content into your `en.json` / `fr.json` files.

5. **Images** — All photos use Unsplash URLs. Replace with your own photos when ready.
   Recommended: use `next/image` with proper `width`/`height` for production.

6. **Logo** — `/public/logo.png` — already in your project, no change needed.

## Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--green` | `#2ea82a` | Primary buttons, accents |
| `--green-dark` | `#1a6b18` | Text on light, hover states |
| `--green-deep` | `#0f4a0d` | Dark section backgrounds, headings |
| `--mint` | `#e8f7e8` | Page background, card backgrounds |
| `--mint-deep` | `#b8e8b8` | Borders, dividers |
| `--text-muted` | `rgba(15,61,13,0.55)` | Body text, descriptions |

## Fonts

- **Syne** (800 weight) — headings, labels, buttons
- **DM Sans** (300–700) — body text, forms

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/(marketing)/page.tsx` | Hero, about, programs, CTA, location |
| `/about` | `app/(marketing)/about/page.tsx` | Mission, vision, methodology |
| `/courses` | `app/(marketing)/courses/page.tsx` | 4 program rows + levels grid |
| `/contact` | `app/(marketing)/contact/page.tsx` | Form + map + details |
| `/register` | `app/(marketing)/register/page.tsx` | 3-step wizard with confirmations |

## Notes

- The `(marketing)/layout.tsx` is a **client component** (uses `useState` for lang).
  If you need SSR for lang, move to a context provider or use `next-intl` locale routing.
- All dashboard routes (`/dashboard/*`, `/admin/*`, `/student/*`, etc.) are **unchanged**.
- The `register/page.tsx` is a UI mockup — wire up the `onSubmit` to your existing
  Supabase `actions.ts` server action for production use.
