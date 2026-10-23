/* ---------------------------------------------------------------------------
   Contact form -> Formspree
   ---------------------------------------------------------------------------
   Webflow forms normally post to Webflow's own servers, which do not exist for
   a self-hosted copy. This submits the form to Formspree instead, and reuses
   the markup Webflow already generated: the .w-form-done block on success and
   the .w-form-fail block on failure.

   SETUP: put your Formspree form ID in the data-formspree attribute on the
   <form> in contact/contact-b.html. Nothing else to change.

   The <form action> is the same endpoint, so if JavaScript is unavailable the
   browser posts straight to Formspree and shows Formspree's own confirmation.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var PLACEHOLDER = "YOUR_FORM_ID";

  function wrapper(form) {
    // Webflow puts the form and its done/fail siblings inside a .w-form div
    var el = form.parentElement;
    while (el && !el.classList.contains("w-form")) el = el.parentElement;
    return el || form.parentElement;
  }

  function show(form, which) {
    var w = wrapper(form);
    if (!w) return;
    var done = w.querySelector(".w-form-done");
    var fail = w.querySelector(".w-form-fail");
    if (done) done.style.display = which === "done" ? "block" : "none";
    if (fail) fail.style.display = which === "fail" ? "block" : "none";
    form.style.display = which === "done" ? "none" : "";
  }

  function button(form) {
    return form.querySelector('[type="submit"]');
  }

  function busy(form, on) {
    var b = button(form);
    if (!b) return;
    if (on) {
      b.dataset.restore = b.value || b.textContent;
      var wait = b.getAttribute("data-wait");
      if (wait) { if ("value" in b) b.value = wait; else b.textContent = wait; }
      b.disabled = true;
    } else {
      var r = b.dataset.restore;
      if (r) { if ("value" in b) b.value = r; else b.textContent = r; }
      b.disabled = false;
    }
  }

  // Capture phase on document: runs before Webflow's own submit handler on the
  // form, so Webflow never tries to post this to its servers.
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || !form.matches || !form.matches("form[data-formspree]")) return;

    e.preventDefault();
    e.stopPropagation();

    var id = (form.getAttribute("data-formspree") || "").trim();
    if (!id || id === PLACEHOLDER) {
      show(form, "fail");
      console.error(
        "[contact-form] Formspree is not configured yet.\n" +
        "Create a form at https://formspree.io, then replace " + PLACEHOLDER +
        ' in the data-formspree attribute on <form id="email-form"> ' +
        "in contact/contact-b.html with your form ID."
      );
      return;
    }

    if (typeof form.reportValidity === "function" && !form.reportValidity()) return;

    busy(form, true);

    fetch("https://formspree.io/f/" + id, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) { form.reset(); show(form, "done"); }
        else { show(form, "fail"); }
      })
      .catch(function () { show(form, "fail"); })
      .then(function () { busy(form, false); });
  }, true);
})();
