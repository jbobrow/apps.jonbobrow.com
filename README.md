# app.jonbobrow.com

A small gallery of the apps I make: one colored “room” per app on the homepage, and a page for each app.
Plain HTML, CSS and a little JavaScript. There’s no build step: GitHub Pages serves the files as they are.

## Structure

```
index.html              Homepage: intro paragraph + one room (band) per app
about/index.html        About page
<app>/index.html        One page per app: now-departing, cookbo, pointerpals,
                        evening-reader, audio-bubble, nyc-parking
assets/css/site.css     All styles, app colors, and the page transition
assets/js/head.js       Runs before first paint (draft mode, transition type)
assets/js/site.js       Cookbo’s produce drop, smooth scroll from the intro words
assets/img/<app>/       Icons and screenshots (webp), from each app’s AppStore folder
assets/video/           Now Departing watch loop, Audio Bubble app preview
assets/media/<app>/     Your demo videos, close-ups and process images (see “Placeholders”)
CNAME                   app.jonbobrow.com
```

## Preview locally

```
cd ~/Developer/app.jonbobrow.com
python3 -m http.server 8000
```
Then open http://localhost:8000. (Opening index.html directly works too, but the page transition needs a server.)

## Drafts and placeholders

Until launch, `LAUNCHED = false` in `assets/js/head.js` shows every draft section and empty placeholder.
Set it to `true` when the site goes live: drafts and empty placeholders disappear, and `?draft` on any URL brings them back.

Placeholders fill themselves in. Each one looks for a file by name and shows it if it’s there, so you just drop files in:

| Where | File | Notes |
|---|---|---|
| App page, “See it in use” | `assets/media/<app>/demo.mp4` | Portrait screen recording, 30–60 s. Cookbo, PointerPals, Evening Reader, NYC Parking. |
| App page, “The details” cards | `assets/media/<app>/closeup-1.mp4`, `-2`, `-3` (`-4`) | Short silent loops, 4–8 s, in card order. Until then the card shows its screenshot. |
| App page, “How it came together” | `assets/media/<app>/process-1.webp`, `process-2.webp` | Sketches, early builds, prompts. `.jpg`, `.png` or `.gif` work too. |
| About page | `assets/media/about/portrait.webp`, `workspace.webp` | Portrait around 4:5. |

Videos can be `.mp4` or `.webm`; keep them small (H.264, about 720 px wide, no audio for loops). For example:
`ffmpeg -i in.mov -vf scale=720:-2 -c:v libx264 -crf 26 -an -movflags +faststart closeup-1.mp4`

“How it came together” for Now Departing, Cookbo and PointerPals uses your write-ups from jonathanbobrow.com. Evening Reader, Audio Bubble and NYC Parking have prompts to replace.
When a draft is ready, remove `draft` from its `<section>` and the “Draft” tag from its heading.

## The page transition

“Room expands” uses cross-document View Transitions (Chrome/Edge 126+, Safari 18.2+). Other browsers just navigate normally.
Each room on the homepage and each app page’s hero share `view-transition-name`s: `room-<app>` (the color), `title-<app>`, `meta-<app>` and `media-<app>` (the main image).
If you rename or add an app, keep those names matching on both sides. People who prefer reduced motion get no transition.

## App colors

In `assets/css/site.css`, under “App themes”: `--bg` (room color), `--fg` (text), `--meta` (the small line above the title), and the primary button colors.

## Adding an app

1. Add a room to `index.html` (copy one, change the slug, text, colors and `view-transition-name`s, and renumber).
2. Copy an app folder, e.g. `cookbo/`, to the new slug and update the text, images and the “Next room” at the bottom.
3. Point the previous app’s “Next room” at the new one.
4. Add a theme line for `[data-app="<slug>"]` in `site.css`.

## To do

- Evening Reader: add the App Store link once it’s live (see the TODO in `evening-reader/index.html`).
- Write “How it came together” for Evening Reader, Audio Bubble and NYC Parking, and the About page’s “How I make these apps”.
- Drop in demo videos, close-ups, process images and a portrait (see the table above).
- Set `LAUNCHED = true` in `assets/js/head.js`.
- Social preview images (`og:image`) for each page.

## Deploy (GitHub Pages)

1. Create an empty repo on GitHub, e.g. `jbobrow/app.jonbobrow.com`.
2. Push:
   ```
   git add -A && git commit -m "First version of app.jonbobrow.com"
   git branch -M main
   git remote add origin git@github.com:jbobrow/app.jonbobrow.com.git
   git push -u origin main
   ```
3. On GitHub: Settings → Pages → Source: “Deploy from a branch”, Branch: `main` / root.
4. DNS: add a CNAME record for `app` pointing to `jbobrow.github.io`. Then in Settings → Pages, confirm the custom domain and turn on “Enforce HTTPS”.
