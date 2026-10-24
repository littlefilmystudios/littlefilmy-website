# littlefilmy — static HTML/CSS site

A self-contained static copy of **https://littlefilmy.webflow.io/**, mirrored 2026-10-23.
No Webflow account, no build step, no server-side code — plain HTML, CSS, JS and media.
Upload the contents of this folder to any web host and it runs.

207 MB · 18 pages · 249 asset files · every internal link verified.

## Pages

| File | was |
|---|---|
| `index.html` | `/` |
| `about.html` | `/about` |
| `producer.html` | `/producer` (titled "Blog") |
| `work/work-a.html` | `/work/work-a` — Commercials |
| `work/work-b.html` | `/work/work-b` — Animation |
| `work/work-c.html` | `/work/work-c` |
| `contact/contact-a.html` | `/contact/contact-a` |
| `contact/contact-b.html` | `/contact/contact-b` |
| `contact/contact-c.html` | `/contact/contact-c` |
| `old-home.html` | `/old-home` |
| `home-b.html` `home-c.html` `home-d.html` | `/home-b` `/home-c` `/home-d` |
| `template-info/licensing.html` | `/template-info/licensing` |
| `template-info/style-guide.html` | `/template-info/style-guide` |
| `template-info/changelog.html` | `/template-info/changelog` |
| `404.html` | Webflow's not-found page |
| `401.html` | Webflow's password-protected page |

`old-home`, `home-b/c/d`, `work-c`, `contact-b/c` and the `template-info` pages are not
linked from the navigation — they are unused Filmax-template pages that were still
published. Delete them if you don't want them public.

## Folders

```
assets/css/     Webflow stylesheet, self-hosted Google Fonts, your custom.css
assets/js/      jQuery, the Webflow runtime, the lazy-video loader and the
                contact-form handler
assets/img/     153 images, including every srcset size
assets/fonts/   9 woff2 files — THICCCBOI + Playfair Display
assets/media/   76 background videos (mp4 + webm pairs)
_mirror-manifest.json   every source URL mapped to its local file
```

Every link, image, stylesheet, script, font and video uses a **relative** path, so the
site works from the domain root, from a subfolder, or opened straight off disk.

## Uploading

**cPanel / FTP / shared hosting** — upload the *contents* of this folder (not the folder
itself) into `public_html/`. `index.html` becomes the homepage. Nothing to configure.

```bash
rsync -av --delete ./ user@yourhost:~/public_html/
```

**Netlify / Cloudflare Pages / GitHub Pages** — point the deploy at this folder.
No build command; publish directory is this folder.

**Vercel** — `vercel --prod` from inside this folder.

Note the 207 MB size: it is almost all video. GitHub Pages has a 1 GB soft limit and a
100 MB per-file cap — the largest file here is well under that, so it fits, but a host
with no bandwidth cap is a better home for this much video.

## Pretty URLs (optional)

Pages carry `.html` extensions, which works everywhere with no config. An `.htaccess`
is included that strips them on Apache, plus caching and gzip rules. For nginx:

```nginx
try_files $uri $uri.html $uri/ =404;
error_page 404 /404.html;
```

Netlify and Cloudflare Pages strip `.html` automatically.

## Known caveats

- **The contact form needs one setup step** — see "Contact form" below. Until you add
  your Formspree ID it shows the error message instead of sending.
- **`contact/contact-c.html` carried Filmax demo details and has been corrected** —
  see "What changed" below. It is still not in your navigation, so link to it or
  delete it as you prefer.
- **Vimeo lightbox clips still stream from Vimeo**, exactly as before. Only the
  background videos were downloaded.
- **One dead template link**: `old-home.html` links to
  `https://filmax.webflow.io/post/iriedaily`, a leftover from the Filmax demo. It was
  already broken on your live site.
- **No CMS.** Webflow collection content is baked into the HTML. To change copy or swap
  an image, edit the HTML — or keep editing in Webflow and re-mirror.

## Contact form

`contact/contact-b.html` has the only form on the site. Webflow forms post to Webflow's
own servers, which do not exist for a self-hosted copy, so it is wired to
[Formspree](https://formspree.io) instead (free tier: 50 submissions/month).

**One step to turn it on:**

1. Sign up at formspree.io and create a form. You get an ID that looks like `mwpevknb`.
2. Open `contact/contact-b.html`, find `<form id="email-form"`, and replace **both**
   occurrences of `YOUR_FORM_ID` on that line with your ID:

   ```html
   action="https://formspree.io/f/mwpevknb" data-formspree="mwpevknb"
   ```

3. Submit the form once on the live site and confirm the address Formspree emails you.

That is all. `assets/js/contact-form.js` handles the rest: it posts in the background
and reuses the success and error blocks Webflow already generated, so a successful send
shows "Thank you! Your submission has been received!" and a failure shows the "Oops!"
message, both in the site's own styling. The submit button shows "Please wait..." while
sending. The `action` attribute is the same endpoint, so if a visitor has JavaScript
off the browser posts straight to Formspree and shows Formspree's own confirmation page.

Until you do step 2 the form shows the error message and logs an explanation to the
browser console. Nothing is sent anywhere.

Submissions arrive with the subject "New enquiry from littlefilmy.com". Change it in the
hidden `_subject` field on that same line. To use a different provider (Getform, Basin,
Web3Forms — they all take the same POST), change the URL in `contact-form.js`.

Note: `contact/contact-a.html`, the Contact page in your navigation, has no form — it
lists email, phone and Instagram. This only matters if you link to contact-b.
- **`contact/contact-a.html` shows one phone number and links another**: it displays
  `+91 8210131800` but the tap-to-call link goes to `+91 2235304819` (both appear on
  the page). That is how your live site is; I left it alone rather than guess which
  one is right.

## Titles, descriptions and share cards

Every page had the Filmax template's title and description — `About - Filmax -
Webflow HTML website template` and so on — on all 17 pages except the homepage.
Those are rewritten with real titles and descriptions, and the matching
`og:`/`twitter:` tags are set so link previews read correctly.

**The share image uses an absolute URL, which means it is tied to a domain:**

```
https://littlefilmy.com/assets/img/684677cb1062c2bf7ac2841e_Little-Filmy-61cbd624.jpg
```

`littlefilmy.com` is an assumption. Open Graph requires an absolute URL — a relative
path produces no preview image at all — so a domain had to be chosen. If you host
somewhere else, change it everywhere in one command from inside this folder:

```bash
grep -rl 'https://littlefilmy.com' . --include='*.html' | xargs sed -i '' 's|https://littlefilmy\.com|https://your-domain.com|g'
```

That updates `og:image` and `og:url` on all 18 pages. Until the domain matches where
the site is actually served, link previews on WhatsApp, LinkedIn and Facebook will not
show the image.

## Copy corrections

Typos carried over from the live site, fixed here:

| Page | was | now |
|---|---|---|
| producer | Balalji Films | Balaji Films |
| producer | "has don several other hats" | "has donned several other hats" |
| index | Short flm | Short Film |
| work-b (x6) | wEB sHOW tITLE dESIGN | Web Show Title Design |
| index, work-a (x4) | Religare health Insurance | Religare Health Insurance |

All of these are still present on the live Webflow site.

## Video loading

Webflow gives every background video `autoplay` and a real `<source src>`, so a page
fetched all of its clips at once — the homepage pulled **35 MB and started 14
simultaneous video decodes** before the visitor had scrolled a pixel.

Each `<source>` now carries `data-src`, the `<video>` has `preload="none"`, and
`assets/js/lazy-video.js` loads a clip only when its tile comes within 200px of the
viewport. Tiles that scroll away are paused, and everything pauses when the tab is
hidden.

| Page | first load before | first load now |
|---|---|---|
| Home (14 tiles) | 35.3 MB | **9.0 MB** |
| Commercials (16 tiles) | 38.8 MB | **2.5 MB** |
| Animation (6 tiles) | 17.0 MB | **3.0 MB** |

At most five clips play at once now instead of fourteen, which matters as much for
phone battery and CPU as it does for bandwidth. Scrolling the whole homepage still
ends up fetching ~30 MB, as it must — the saving is for the majority who never
scroll that far.

Each tile keeps its poster frame as a CSS background image, so nothing looks
different before a clip arrives, and the Vimeo lightbox is untouched.

Visitors who have asked for reduced motion, or who have Data Saver on, get poster
frames only and no autoplay; the tile's link still opens the full film.

### The one file still worth fixing

The homepage's remaining 9 MB is almost entirely its first tile:

```
BAJAJ-RE_for-web-transcode.mp4   8.3 MB   15.2s   1280x720   4.6 Mbps
```

4.6 Mbps is roughly four times what a silent looping background clip needs. Re-encoded
at ~1.2 Mbps it would be about 2 MB and look the same at tile size, taking the homepage
to roughly **2.7 MB**. `ffmpeg` is not installed on this machine, but the command is:

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -vf scale=1280:-2 -an -movflags +faststart output.mp4
```

`-an` drops the audio track, which a muted background video never uses. The same is
worth doing to the other clips over ~2 MB.

## What changed from the Webflow original

- **Fonts are self-hosted.** The original pulled Playfair Display through Google's
  `webfont.js` loader at runtime. That loader is gone; `assets/css/google-fonts.css`
  plus local woff2 files replace it, so there are no third-party font requests.
- **The "Made in Webflow" badge is hidden** by a rule in `assets/css/custom.css`.
  Webflow's own code export omits it too. Delete the rule to bring it back.
- **`integrity` and `crossorigin` attributes were stripped** from `<script>` and
  `<link>` tags — those hashes only validate against Webflow's CDN copies and would
  block the local files from loading.
- **The contact form posts to Formspree** rather than to Webflow (see above).
- **Two placeholder email addresses were corrected to `littlefilmy@gmail.com`**: on
  `contact-b.html` the "email me at littlefilmy@gmail.com" link pointed at the
  template's `info@yoursite.com`, and on `contact-c.html` both the shown address and
  its link were that placeholder.
- **`contact-c.html`'s remaining demo details were replaced** with the real ones from
  `contact-a.html`:

  | Row | was | now |
  |---|---|---|
  | Address | Ceintuurbaan 123H, Amsterdam | Yagna Nagar, Andheri (W), Mumbai, India |
  | Phone | `800-123-4567` | `+91 2235304819` |
  | Instagram | `@webflow` | `@little.filmy` |
  | Facebook | `@webflow` | `@littlefilmyproductions` |
  | Twitter | `@webflow` | **relabelled Vimeo** → `@littlefilmy` |

  The Twitter row became Vimeo because there is no Little Filmy Twitter account and
  Vimeo is the third social listed on `contact-a.html`. Delete that row if you would
  rather have five entries than six.

  Your live Webflow site still has all of the demo values above.
- **Page titles, meta descriptions and social tags were rewritten** and five typos
  corrected — see the sections above.
- **Background videos load lazily** instead of all at once — see "Video loading".
- Nothing else. Markup, classes, layout and animations are byte-for-byte the original.

## Editing

The Webflow stylesheet is minified and machine-generated — don't edit it. Put your
changes in **`assets/css/custom.css`**, which is already linked last on every page, so
anything in it wins.

## Previewing locally

```bash
npx serve .
```

Or, in this repo, the `littlefilmy-static` entry in `.claude/launch.json` serves it
on port 4173.
