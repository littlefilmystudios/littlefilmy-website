/* ---------------------------------------------------------------------------
   Lazy background video
   ---------------------------------------------------------------------------
   Webflow ships every background video with autoplay and a real <source src>,
   so a page with 14 tiles downloads all 14 at once — about 35 MB before the
   visitor has scrolled. Each <source> now carries data-src instead, and the
   <video> has preload="none", so nothing is fetched until the tile is close to
   the viewport. Tiles that scroll away are paused, which keeps the CPU and the
   battery out of trouble on a phone.

   Viewport gating alone is not enough on Animation, where all six tiles fit on
   one screen, so all six used to start together and split the connection six
   ways — every tile arrived late instead of the first two arriving quickly. No
   more than MAX_PARALLEL are fetched at a time now, in document order, and a
   slot is handed on as soon as a clip has buffered enough to play rather than
   when it has finished, so the rest still fill in steadily behind it.

   The poster frame is the video element's CSS background-image, so a tile looks
   exactly the same before its video arrives.

   Nothing loads automatically when the visitor has asked for reduced motion,
   has Data Saver on, or is on a 2G connection: those tiles stay on their poster
   frame, and the tile's own link still opens the full film in the lightbox.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var MARGIN = "200px 0px";   // start fetching this far before the tile is on screen
  var MAX_PARALLEL = 2;       // clips fetching at once
  var SLOT_TIMEOUT = 8000;    // ms before a stalled clip stops holding its slot

  var queue = [];             // waiting to start, in document order
  var active = 0;

  function videos() {
    return [].slice.call(document.querySelectorAll("video[data-lazy-video]"));
  }

  function tryPlay(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay refused; poster stays */ });
  }

  function begin(v) {
    active++;

    var released = false;
    function release() {
      if (released) return;
      released = true;
      clearTimeout(timer);
      v.removeEventListener("canplay", release);
      v.removeEventListener("error", release);
      active--;
      pump();
    }
    var timer = setTimeout(release, SLOT_TIMEOUT);
    v.addEventListener("canplay", release);
    v.addEventListener("error", release);

    var sources = v.querySelectorAll("source[data-src]");
    for (var i = 0; i < sources.length; i++) {
      sources[i].src = sources[i].getAttribute("data-src");
    }
    v.load();
    tryPlay(v);
  }

  function pump() {
    while (active < MAX_PARALLEL && queue.length) {
      var v = queue.shift();
      if (v.dataset.lazyLoaded) continue;
      v.dataset.lazyLoaded = "1";
      begin(v);
    }
  }

  function want(v) {
    if (v.dataset.lazyLoaded) { tryPlay(v); return; }   // already fetched: just resume
    if (queue.indexOf(v) === -1) queue.push(v);
    pump();
  }

  function drop(v) {
    var i = queue.indexOf(v);
    if (i !== -1) queue.splice(i, 1);                   // scrolled past before its turn
    if (!v.paused) v.pause();
  }

  var hold = false;   // leave every tile on its poster frame
  try {
    hold = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var c = navigator.connection;
    if (c) {
      if (c.saveData) hold = true;
      if (c.effectiveType === "2g" || c.effectiveType === "slow-2g") hold = true;
    }
  } catch (e) {}

  function start() {
    var vs = videos();
    if (!vs.length) return;

    // Each tile is already a link that opens the full film in the lightbox, so
    // adding <video controls> here would only swallow that click.
    if (hold) return;

    if (!("IntersectionObserver" in window)) {   // old browser: load them all
      vs.forEach(want);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) want(e.target);
        else drop(e.target);
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
