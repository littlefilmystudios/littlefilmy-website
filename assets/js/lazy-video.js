/* ---------------------------------------------------------------------------
   Lazy background video
   ---------------------------------------------------------------------------
   Webflow ships every background video with autoplay and a real <source src>,
   so a page with 14 tiles downloads all 14 at once — about 35 MB before the
   visitor has scrolled. Each <source> now carries data-src instead, and the
   <video> has preload="none", so nothing is fetched until the tile is close to
   the viewport. Tiles that scroll away are paused, which keeps the CPU and the
   battery out of trouble on a phone.

   The poster frame is the video element's CSS background-image, so a tile looks
   exactly the same before its video arrives.

   Nothing loads automatically when the visitor has asked for reduced motion or
   has Data Saver on: those tiles stay on their poster frame, and the tile's own
   link still opens the full film in the lightbox.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var MARGIN = "200px 0px";   // start fetching this far before the tile is on screen

  function videos() {
    return [].slice.call(document.querySelectorAll("video[data-lazy-video]"));
  }

  function load(v) {
    if (v.dataset.lazyLoaded) return;
    v.dataset.lazyLoaded = "1";
    var sources = v.querySelectorAll("source[data-src]");
    for (var i = 0; i < sources.length; i++) {
      sources[i].src = sources[i].getAttribute("data-src");
    }
    v.load();
  }

  function play(v) {
    load(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay refused; poster stays */ });
  }

  var reduced = false, saveData = false;
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    saveData = !!(navigator.connection && navigator.connection.saveData);
  } catch (e) {}

  function start() {
    var vs = videos();
    if (!vs.length) return;

    // Reduced motion or Data Saver: leave every tile on its poster frame.
    // Each tile is already a link that opens the full film in the lightbox,
    // so adding <video controls> here would only swallow that click.
    if (reduced || saveData) return;

    if (!("IntersectionObserver" in window)) {   // old browser: behave as before
      vs.forEach(play);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) play(v);
        else if (!v.paused) v.pause();
      });
    }, { rootMargin: MARGIN, threshold: 0 });

    vs.forEach(function (v) { io.observe(v); });

    // Pause everything while the tab is in the background.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) vs.forEach(function (v) { if (!v.paused) v.pause(); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
