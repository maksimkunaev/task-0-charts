# charts

Line charts drawn by hand on an HTML canvas, with a draggable range slider and a day/night theme. Built as an entry for the Telegram chart contest.

<!-- Add a screenshot or GIF here: docs/screenshot.png -->

Demo: https://maksimkunaev.github.io/charts/

## What it does

- Loads chart datasets from a Firebase Realtime Database and renders one card per dataset.
- Each card has a large chart and a small overview chart underneath it. Drag or resize the slider window on the overview to choose the date range the large chart shows. Touch events work too.
- Click the large chart to see a tooltip with the date and the values at that point.
- Checkboxes under each card show or hide individual lines.
- A switch toggles between day and night themes.

All drawing uses the Canvas 2D API directly. Firebase is the only runtime dependency, and it is used only to fetch the data.

## Tech stack

- Vanilla JavaScript (ES classes, CommonJS modules plus ES imports for Firebase)
- Canvas 2D API
- Firebase 9 (Realtime Database)
- Webpack 4 with webpack-dev-server 3; `ts-loader` transpiles the JavaScript

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run start   # dev server at http://localhost:8080
npm run build   # production build into dist/
```

Older checkouts needed `npm i --legacy-peer-deps` because of unused Webpack 5 loaders in `package.json`. Those loaders have been removed, so a plain `npm install` resolves now.

The Firebase web config (project ID, database URL and so on) is hardcoded in `main()` in `src/index.js`. To use your own database, replace it there. The app reads the `charts` key at the database root.

## Data format

Each dataset follows the Telegram contest format. `src/chart_data.json` holds five sample datasets in this shape. The app does not import that file; it fetches the data from Firebase.

```json
{
  "columns": [["x", 1542412800000, ...], ["y0", 37, ...], ["y1", 22, ...]],
  "types":   { "x": "x", "y0": "line", "y1": "line" },
  "names":   { "y0": "#0", "y1": "#1" },
  "colors":  { "y0": "#3DC23F", "y1": "#F34C44" }
}
```

## Project structure

```
src/
  index.html        page shell with a loading spinner
  index.js          entry point: fetches data from Firebase, builds a card per dataset, theme switch, checkboxes
  charts.js         Chart class: canvas drawing for the main and overview charts, tooltips
  slider.js         Slider class: draggable/resizable range window (mouse and touch)
  utils.js          DOM templates, date and number formatting, hex-to-RGB
  css/styles.css    styles, copied to dist/css at build time
  chart_data.json   sample datasets (not loaded by the app)
webpack.config.js
tsconfig.json       compiler options for ts-loader
```

## Known issues

- `main()` in `src/index.js` logs `JSON.parse(data.charts)` but passes `data.charts` to `init()` unparsed. One of these two calls will fail, depending on whether the database stores `charts` as a JSON string or as an array. Check the stored shape and keep the matching call.
- The toolchain (Webpack 4, webpack-dev-server 3, TypeScript 3) is end-of-life. It still builds on current Node.js, but moving to Webpack 5 or Vite would be a sensible next step.
- There are no tests.

## License

MIT, see [LICENSE](LICENSE).
