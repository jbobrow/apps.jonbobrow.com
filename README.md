# apps.jonbobrow.com

A small gallery of the apps I make: one colored “room” per app on the homepage, and a page for each app.
Plain HTML, CSS and a little JavaScript. There’s no build step: GitHub Pages serves the files as they are.

## Structure

```
index.html              Homepage: intro paragraph + one room (band) per app
about/index.html        About page
<app>/index.html        One page per app: now-departing, cookbo, pointerpals,
                        evening-reader, audio-bubble, nyc-parking
assets/css/site.css     All styles, app colors, and the page transition
assets/css/fonts.css    Bricolage Grotesque, inlined (SIL Open Font License)
assets/js/head.js       Runs before first paint (draft mode, transition type)
assets/js/site.js       Cookbo’s produce drop, smooth scroll from the intro words
assets/img/<app>/       Icons and screenshots (webp), from each app’s AppStore folder
assets/video/           Now Departing watch loop, Audio Bubble app preview
assets/media/<app>/     Your demo videos, close-ups and process images (see “Placeholders”)
CNAME                   apps.jonbobrow.com
```

## Preview locally

```
cd ~/Developer/apps.jonbobrow.com
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

“Room expands” uses cross-document View Transitions (Chrome/Edge 126+, Safari 18.2+). Other browsers just navigate normally, and people who prefer reduced motion get no transition.

How it stays clean:
- Only the room being opened (or returned to) is named, by `assets/js/head.js` and `site.js`, so the browser snapshots a handful of pieces instead of every room.
- Each room is marked up with `data-vt` pieces: `room` (the color), `meta`, `title` and `media` travel together; `rest`, `extra` and `nav` fade out or in around them. On app pages the hero carries the same names statically.
- Each moving piece is drawn from one snapshot, never two cross-faded: opening uses the new (larger) page, going back keeps the old (larger) one. That’s why the title and phone stay sharp.
- Whatever sits under the room on screen (the next rooms, the footer) stays glued to the room’s bottom edge: pushed down and dissolving as a room opens, rising back up with it as it closes.
- Phone screenshots keep one shape (9:16) at every size, and titles hug their text and never wrap (they size to their column), so nothing stretches mid-flight.
- The font is inlined in `assets/css/fonts.css`, so no text ever swaps to a fallback font during a transition.

Watch it in slow motion: add `?slowmo` to any URL (10× slower, remembered for the tab), `?slowmo=4` for 4×, `?slowmo=0` to turn it off.
Timing lives at the top of the “Room expands” section in `site.css` (`--vt-move`, `--vt-ease`).

## Layout sizes

Rooms and app headers stay two columns down to 641 px wide (iPad portrait included), with pictures and titles scaling to fit; below 900 px each room shows just its main picture. Phones (640 px and under) stack.

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

1. Create an empty repo on GitHub, e.g. `jbobrow/apps.jonbobrow.com`.
2. Push:
   ```
   git add -A && git commit -m "First version of apps.jonbobrow.com"
   git branch -M main
   git remote add origin git@github.com:jbobrow/apps.jonbobrow.com.git
   git push -u origin main
   ```
3. On GitHub: Settings → Pages → Source: “Deploy from a branch”, Branch: `main` / root.
4. DNS: add a CNAME record for `app` pointing to `jbobrow.github.io`. Then in Settings → Pages, confirm the custom domain and turn on “Enforce HTTPS”.
