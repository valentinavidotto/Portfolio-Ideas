# Valentina Vidotto — Portfolio

Static site built with plain HTML, CSS, and JavaScript. Deploys to GitHub Pages in one step.

## File structure

```
valentina-site/
├── index.html          ← Home + contact form
├── macro.html          ← Live macro dashboard
├── opinions.html       ← Blog / opinions
├── projects.html       ← Publications & conferences
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── nav.js      ← Mobile nav toggle
│       ├── contact.js  ← Contact form (Formspree)
│       ├── opinions.js ← Tag filter
│       └── macro.js    ← FRED + Alpha Vantage + World Bank maps
└── README.md
```

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `valentina-vidotto`)
2. Upload all files maintaining the folder structure above
3. Go to **Settings → Pages**
4. Under *Source* select **Deploy from a branch**
5. Choose **main** branch, **/ (root)** folder → Save
6. Your site is live at `https://yourusername.github.io/valentina-vidotto/`

To use a custom domain (e.g. `valentinavidotto.com`):
- Add a `CNAME` file to the root containing just your domain name
- Point your domain's DNS to GitHub Pages (see GitHub docs)

## Data sources

| Chart | Source | API key needed |
|---|---|---|
| T-curve (10Y–2Y spread) | FRED | No |
| US CPI | FRED | No |
| Brent crude | Alpha Vantage | Yes — free at alphavantage.co |
| Inflation world map | World Bank | No |
| GDP growth world map | World Bank | No |
| Unemployment world map | World Bank | No |

### Alpha Vantage key
The Brent crude chart uses the `BRENT` commodity endpoint.
Get a free key at https://www.alphavantage.co/support/#api-key
Paste it into the key bar on the Macro view page. It is saved to browser localStorage so you only enter it once.

## Contact form (Formspree)

The contact form is ready-wired for Formspree (free, no backend needed):

1. Sign up at https://formspree.io
2. Create a new form
3. Copy your form ID (e.g. `xpwzabcd`)
4. Open `assets/js/contact.js` and replace `YOUR_FORM_ID` with it
5. You will receive contact emails directly

## Customise

- **Photo**: replace the initials placeholder in `index.html` with `<img src="assets/img/photo.jpg" alt="Valentina Vidotto" />`  
  Recommended size: 400×530 px, compressed JPEG.
- **LinkedIn URL**: update the `href` in the footer across all four HTML files.
- **Spotify URL**: update the pill link in `index.html`.
- **Opinions**: add new `<article class="blog-item" data-tag="policy|market|ideas">` blocks in `opinions.html`.
- **Projects**: add new cards in `projects.html`.
