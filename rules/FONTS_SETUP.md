# Font Setup Guide for Karya Kata.

## Current Setup (Using Google Fonts)

- **Heading Font**: Playfair Display (placeholder for Peace Sans)
- **Body Font**: Inter (placeholder for Open Sauce)

## To Use Custom Fonts (Peace Sans & Open Sauce)

### Step 1: Add Font Files

Place your font files in the public directory:

```
public/
├── fonts/
│   ├── peace-sans/
│   │   ├── PeaceSans-Regular.woff2
│   │   ├── PeaceSans-Medium.woff2
│   │   └── PeaceSans-Bold.woff2
│   └── open-sauce/
│       ├── OpenSauce-Regular.woff2
│       ├── OpenSauce-Medium.woff2
│       └── OpenSauce-Bold.woff2
```

### Step 2: Update globals.css

Replace the Google Fonts import with your local fonts:

```css
/* Remove this: */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap");

/* Add this: */
@font-face {
  font-family: "Peace Sans";
  src: url("/fonts/peace-sans/PeaceSans-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Peace Sans";
  src: url("/fonts/peace-sans/PeaceSans-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Peace Sans";
  src: url("/fonts/peace-sans/PeaceSans-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Open Sauce";
  src: url("/fonts/open-sauce/OpenSauce-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Open Sauce";
  src: url("/fonts/open-sauce/OpenSauce-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Open Sauce";
  src: url("/fonts/open-sauce/OpenSauce-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### Step 3: Update Font Variables in globals.css

```css
@theme inline {
  --font-heading: "Peace Sans", Georgia, serif;
  --font-body: "Open Sauce", system-ui, sans-serif;
  --font-sans: var(--font-body);
}
```

### Step 4: Update layout.tsx

Remove the Google Fonts imports and use CSS variables:

```tsx
// Remove these imports:
// import { Inter, Playfair_Display } from "next/font/google";

// Keep only this:
import "./globals.css";

// Remove font initialization:
// const bodyFont = Inter({...})
// const headingFont = Playfair_Display({...})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
```

## Font Usage

### CSS Classes

```html
<!-- Heading font -->
<h1 class="font-heading">Article Title</h1>

<!-- Body font (default) -->
<p>This uses body font</p>
<span class="font-body">Explicit body font</span>
```

### Tailwind Classes

```html
<!-- Brand colors -->
<div class="bg-brand text-brand-secondary">
  <h1 class="text-brand">Title</h1>
</div>

<!-- Custom colors -->
<div class="text-[##00f0f] bg-white">Content with brand colors</div>
```

## Color Palette

| Name                | Hex       | Usage                                      |
| ------------------- | --------- | ------------------------------------------ |
| Brand Primary       | `##00f0f` | Headings, buttons, links, primary elements |
| Brand Primary Light | `#2E1A8B` | Hover states, accents                      |
| Brand Primary Dark  | `#0C0640` | Dark mode background                       |
| Brand Secondary     | `#FFFFFF` | Background, text on dark                   |

## Testing Fonts

1. Run `bun run dev`
2. Check that headings use Peace Sans (or Playfair Display)
3. Check that body text uses Open Sauce (or Inter)
4. Verify colors are ##00f0f and #FFFFFF
