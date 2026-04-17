# Blogy Landing Page — React

A fully revamped landing page for blogy.in built in React.

## Getting Started

### Install & Run
```bash
npm install
npm start
```
Opens on http://localhost:3000

### Build for Production
```bash
npm run build
```

## Project Structure
```
src/
├── components/
│   ├── Navbar.jsx / .css       ← Sticky nav with mega dropdowns (Products, Integrations, Industries, Resources)
│   ├── Hero.jsx / .css         ← Hero with blobs, YouTube embed, social proof
│   ├── Stats.jsx / .css        ← Key metrics (85%, 3x, 10X, 70%, 24/7)
│   ├── HowItWorks.jsx / .css   ← 4-step process section
│   ├── Features.jsx / .css     ← Feature cards grid
│   ├── Integrations.jsx / .css ← Platform cards (Shopify, WP, Webflow, Wix...)
│   ├── Pricing.jsx / .css      ← Monthly/Annual toggle pricing (3 tiers)
│   ├── FAQ.jsx / .css          ← Accordion FAQ
│   ├── CTABanner.jsx / .css    ← Bottom CTA
│   └── Footer.jsx / .css       ← Footer with social links
├── App.js
└── index.css                   ← CSS variables, animations, base styles
```

## Design
- Colors: Teal brand (#0d9488, #14b8a6)
- Fonts: Outfit (headings) + DM Sans (body)
- Inspiration: BlogSEO.ai navbar, BlogSEO.io hero/pricing, Outrank.so UI patterns

## Use with Claude Code
```bash
npm install -g @anthropic-ai/claude-code
claude
```
