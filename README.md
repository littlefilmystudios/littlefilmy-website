# Little Filmy — website

The Little Filmy website as plain HTML, CSS and JavaScript. No build step, no
framework, no server-side code — upload the contents of this repository to any
web host and it runs.

**Little Filmy** is a boutique film and advertising production studio in Mumbai,
making television commercials, digital films, animation, and short and feature
films.

## Deploying

The site is hosted on **Bluehost** shared hosting at
[littlefilmy.com](https://littlefilmy.com).

Upload the contents of this repository — not the folder itself — into
`public_html/`. `index.html` becomes the homepage. The quickest route through
cPanel is to upload a zip of the repository into `public_html/` and use
**Extract**, since there are around 275 files.

```bash
# or over SSH/rsync, from a clone of this repository
rsync -av --delete --exclude '.git' ./ user@littlefilmy.com:~/public_html/
```

`.htaccess` does the rest: forces HTTPS, redirects `www` to the apex, serves
`/about` as well as `/about.html`, sets cache lifetimes and gzip, and points 404s
at the branded error page. It needs `mod_rewrite`, `mod_expires` and `mod_deflate`,
all of which Bluehost has on by default.

**Other hosts.** Netlify, Cloudflare Pages and Vercel all take this repository
directly with no build command and the repository root as the publish directory.

## Layout

```
index.html              home
about.html              about the studio
work/commercials.html        commercials and digital films
work/animation.html        animation and title design
producer.html           Jayant Raj — director and executive producer
/contact  contact details

assets/css/             stylesheet, self-hosted fonts, custom overrides
assets/js/              jQuery, the Webflow runtime, lazy video
assets/img/             images, including every srcset size
assets/fonts/           woff2 files — THICCCBOI and Playfair Display
assets/media/           background videos (mp4 + webm pairs)

sitemap.xml  robots.txt  .htaccess
_mirror-manifest.json   maps each local file to the URL it came from
```

Every reference is relative, so the site works from a domain root, from a
subfolder, or opened directly from disk.

## One thing to set before going live

**The domain.** `og:image`, `og:url` and `sitemap.xml` use absolute URLs, which
Open Graph requires and which Google needs in a sitemap. They currently point at
the Vercel deployment. When a custom domain is attached, change them everywhere:

```bash
grep -rl 'https://littlefilmy.com' . --include='*.html' --include='*.xml' \
  | xargs sed -i '' 's|https://littlefilmy\.com|https://your-domain.com|g'
```

Also update the `Sitemap:` line in `robots.txt`.

## Notes

- **Fonts are self-hosted.** No third-party font requests.
- **Videos load lazily.** `assets/js/lazy-video.js` fetches a background clip only
  when its tile nears the viewport and pauses clips that scroll away, which keeps
  the home page near 9 MB instead of 35 MB and avoids fourteen simultaneous video
  decodes on a phone. Visitors with reduced-motion or Data Saver get poster frames.
- **Biggest remaining win:** the home page's first clip is a 15-second 720p file
  encoded at 4.6 Mbps. Re-encoded nearer 1.2 Mbps it would be about 2 MB and look
  the same at tile size, taking the page to roughly 2.7 MB:
  ```bash
  ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -vf scale=1280:-2 -an \
    -movflags +faststart output.mp4
  ```
- **Editing.** The main stylesheet is minified and machine-generated. Put changes in
  `assets/css/custom.css`, which loads last on every page.
- **Unlisted pages.** `old-home`, `home-b/c/d`, `work-c` and `template-info/` are
  unused layout variants, excluded from the sitemap and blocked in `robots.txt`.
  They can be deleted.

## Credits

Built on the Filmax template. Fonts: [THICCCBOI](https://github.com/wonderunit/font-thicccboi)
and [Playfair Display](https://fonts.google.com/specimen/Playfair+Display). Some
imagery from [Unsplash](https://unsplash.com/license).
