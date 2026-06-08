# Fonts

The navbar (and the wider design) depends on two self-hosted weights of **PP Mori**
(a commercial typeface from Pangram Pangram). They are referenced via `@font-face`
in `src/layouts/Layout.astro`. Drop the `.woff2` files here with these exact names:

| family             | file                      |
| ------------------ | ------------------------- |
| `PP Mori`          | `PPMori-Regular.woff2`    |
| `PP Mori SemiBold` | `PPMori-SemiBold.woff2`   |

Until these files exist, PP Mori falls back to `system-ui`.

If you'd rather not self-host yet, you can temporarily point the `@font-face`
`src` URLs in `Layout.astro` at the `framerusercontent.com` font URLs from the
original site instead.

**Space Grotesk** needs no file — it's loaded from Google Fonts in `Layout.astro`.
