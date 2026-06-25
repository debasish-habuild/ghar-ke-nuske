# Ingredient 3D Icon Generation Brief

Goal: one consistent **3D icon per ingredient** (17 total) to replace the emoji
in the Kitchen Finder, Search rows, and dashboard. The code already renders
`imageUrl` with an emoji fallback — once an icon is uploaded via the dashboard
("3D icon" field on each ingredient), it appears live in the app.

## Output spec (keep every icon identical in treatment)

- **Format:** PNG with transparent background (or solid app-card color).
- **Canvas:** square, 512×512 px (icons render at 22–24 px, so keep silhouettes
  bold and centered with generous padding).
- **No text, no labels, no drop shadows that bleed past the square.**

## Shared style prompt (prepend to every ingredient)

> A single [SUBJECT], 3D rendered icon, soft clay / blender style, smooth matte
> surfaces, gentle studio lighting, subtle ambient occlusion, vibrant but
> natural colors, centered, isolated on a transparent background, playful
> rounded forms, app icon, high detail, no text.

In Magnific: generate/upscale at a consistent **creativity + resemblance** slider
setting across all 17 so the set looks like one family. Lock the seed/style once
you like the first result.

## Per-ingredient subject prompts

| # | Ingredient | Group | SUBJECT to drop into the prompt |
|---|-----------|-------|---------------------------------|
| 1 | Amla | Dairy & Others | a glossy green amla (Indian gooseberry) fruit |
| 2 | Ashwagandha | Common Herbs | ashwagandha root with a few green leaves |
| 3 | Black Pepper | Kitchen Staples | a small pile of black peppercorns |
| 4 | Cardamom | Kitchen Staples | three green cardamom pods |
| 5 | Garlic | Kitchen Staples | a white garlic bulb with one loose clove |
| 6 | Ghee | Dairy & Others | a small jar of golden ghee with a spoon |
| 7 | Giloy | Common Herbs | a giloy (guduchi) vine stem with heart-shaped leaves |
| 8 | Ginger | Kitchen Staples | a knob of fresh ginger root |
| 9 | Honey | Kitchen Staples | a honey jar with a wooden honey dipper |
| 10 | Lemon | Kitchen Staples | a bright yellow lemon with one leaf |
| 11 | Milk | Dairy & Others | a glass of milk |
| 12 | Neem | Common Herbs | a sprig of neem leaves |
| 13 | Rose Water | Dairy & Others | a small bottle of rose water with a pink rose |
| 14 | Triphala | Common Herbs | a small bowl of triphala powder with three dried fruits |
| 15 | Tulsi | Common Herbs | a tulsi (holy basil) plant sprig in a tiny pot |
| 16 | Turmeric | Kitchen Staples | a turmeric root next to a spoon of turmeric powder |
| 17 | Water | — | a clear glass of water (optional — emoji 💧 is fine) |

## Upload steps

1. Open the web dashboard → **Ingredients** tab.
2. Edit an ingredient → **3D icon** field → upload the PNG (stored under
   `ingredients/`), or paste an exported Magnific URL.
3. Save. The app reads `imageUrl` on next refresh; if blank it falls back to the
   emoji, so you can roll these out one at a time.
