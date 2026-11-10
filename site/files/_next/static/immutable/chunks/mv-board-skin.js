/* ============================================================
   MOVIEVERSE — Board Skin enhancer (progressive layer, ~7KB)
   Adds: data-mv-* hooks for the skin CSS, day-band underlay +
   NOW pins (mirroring the app's 420→1620 min axis), occupancy
   semantics and a glass tooltip. React-owned DOM structure is
   never restructured — only attributes and appended leaves.
   Idempotent; safe under reconciliation + re-renders.
   ============================================================ */
(function () {
  "use strict";
  if (window.__MV_BOARD_SKIN__) return;
  window.__MV_BOARD_SKIN__ = true;

  var TOTAL = 648; // seats per show (bundle: fills = 1 - left/total)
  var AXIS_START = 420;  // 7:00 AM
  var AXIS_SPAN = 1200;  // → 3:00 AM next day (1200 min)

  var OCC_BG = {
    "#34d399": "available",
    "#fbbf24": "filling",
    "#fb7185": "almost-full",
    "#3a3a46": "past"
  };
  var OCC_LABEL = {
    available: "Available",
    filling: "Filling fast",
    "almost-full": "Almost full",
    past: "Started"
  };

  /* ------------------------------------------------ helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function set(el, attr, val) {
    if (el && el.getAttribute(attr) !== val) el.setAttribute(attr, val);
  }
  function occByFill(fill) {
    return fill > 0.42 ? "almost-full" : fill > 0.3 ? "filling" : "available";
  }
  function pct(min) {
    return Math.max(0, Math.min(100, ((min - AXIS_START) / AXIS_SPAN) * 100));
  }
  function nowMin() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function fmtTime(min) {
    var h = Math.floor(min / 60) % 24;
    var m = min % 60;
    return (h + 11) % 12 + 1 + ":" + (m < 10 ? "0" + m : m) + " " + (h < 12 ? "AM" : "PM");
  }
  function bgKey(el) {
    var bg = (window.getComputedStyle ? getComputedStyle(el).backgroundColor : el.style.backgroundColor) || "";
    var m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(bg);
    if (!m) return "";
    switch (m[1] + "," + m[2] + "," + m[3]) {
      case "52,211,153": return "available";  // #34d399
      case "251,191,36": return "filling";    // #fbbf24
      case "251,113,133": return "almost-full"; // #fb7185
      case "58,58,70": return "past";         // #3a3a46
    }
    return "";
  }

  /* --------------------------------- day band + NOW pin */
  function tickNow(track) {
    var n = nowMin();
    var pin = $("[data-mv-now]", track);
    if (n <= AXIS_START || n >= AXIS_START + AXIS_SPAN) {
      if (pin) pin.parentNode.removeChild(pin);
      return;
    }
    if (!pin) {
      pin = document.createElement("span");
      pin.setAttribute("data-mv-now", "");
      track.appendChild(pin);
    }
    pin.style.left = pct(n).toFixed(3) + "%";
  }

  function enhanceBand(card) {
    $$("div.relative.h-1\\.5", card).forEach(function (track) {
      var wrapper = track.parentElement;
      set(wrapper, "data-mv-band", "");
      set(track, "data-mv-track", "");

      if (!$("[data-mv-underlay]", track)) {
        var u = document.createElement("span");
        u.setAttribute("data-mv-underlay", "");
        track.insertBefore(u, track.firstChild);
      }

      $$(":scope > span", track).forEach(function (c) {
        var st = c.getAttribute("style") || "";
        if (/width/i.test(st)) { set(c, "data-mv-elapsed", ""); }
      });

      $$(":scope > span", track).forEach(function (c) {
        var st = c.getAttribute("style") || "";
        if (/width/i.test(st) || c.hasAttribute("data-mv-now")) return;
        var key = bgKey(c);
        if (!key) return;
        set(c, "data-mv-dot", "");
        if (!c.hasAttribute("data-occ")) set(c, "data-occ", key);
        if (!c.hasAttribute("data-time")) {
          var left = parseFloat(c.style.left) || 0;
          var min = AXIS_START + (left / 100) * AXIS_SPAN;
          set(c, "data-time", fmtTime(Math.round(min)));
        }
      });

      tickNow(track);

      var labels = wrapper.querySelector("div.mt-1");
      if (labels) {
        set(labels, "data-mv-bandlabels", "");
        if (labels.getAttribute("data-mv-pos") !== "1") {
          var stops = ["0%", "25%", "55%", "85%", "100%"];
          var align = ["translateX(0)", "translateX(-50%)", "translateX(-50%)", "translateX(-50%)", "translateX(-100%)"];
          var spans = $$(":scope > span", labels);
          spans.forEach(function (s, i) {
            if (stops[i] !== undefined) {
              s.style.position = "absolute";
              s.style.left = stops[i];
              s.style.transform = align[i];
            }
          });
          labels.setAttribute("data-mv-pos", "1");
        }
      }
    });
  }

  /* ---------------------------------------- showtime pills */
  function enhanceStubs(card) {
    $$("a.stub", card).forEach(function (stub) {
      set(stub, "data-mv-stub", "");
      $$(":scope span", stub).forEach(function (sp) {
        var t = (sp.textContent || "").trim();
        var m = /^(2D|3D|IMAX|4DX|ATMOS)$/i.exec(t);
        if (m) set(sp, "data-mv-fmt", m[1] === "ATMOS" ? "Atmos" : m[1].toUpperCase() === "IMAX" ? "IMAX" : m[1]);
      });

      var time = "", price = "", seats = -1, fmtDetected = "";
      var kids = $$(":scope > span", stub);
      if (kids.length) time = (kids[0].textContent || "").trim();
      $$(":scope span", stub).forEach(function (sp) {
        var t = sp.textContent || "";
        var mp = /₹\s*(\d+)/.exec(t);
        if (mp && !price) price = mp[1];
        var ms = /(\d+)\s*seats/.exec(t);
        if (ms) seats = parseInt(ms[1], 10);
        var mf = /^(2D|3D|IMAX|4DX|ATMOS)$/i.exec(t.trim());
        if (mf && !fmtDetected) fmtDetected = mf[1].toUpperCase() === "ATMOS" ? "ATMOS" : mf[1];
      });

      var occ = seats >= 0 ? occByFill(1 - seats / TOTAL) : "available";
      set(stub, "data-occ", occ);
      if (price) set(stub, "data-price", price);
      if (seats >= 0) set(stub, "data-seats", String(seats));
      set(stub, "data-time", time);
      if (fmtDetected) set(stub, "data-f", fmtDetected);
      stub.removeAttribute("title");
    });
  }

  /* ------------------------------------------ theatre cards */
  function enhanceCards(shows) {
    $$("article", shows).forEach(function (card) {
      set(card, "data-mv-card", "");
      enhanceBand(card);
      enhanceStubs(card);
    });
  }

  /* ------------------------------------- featured spotlight */
  function enhanceFeatured(shows) {
    $$(".snap-x a", shows).forEach(function (a) { set(a, "data-mv-spot", ""); });
  }

  /* ------------------------------------------- timeline view */
  function fmtFromText(t) {
    var m = /^(2D|3D|IMAX|4DX|ATMOS)$/i.exec((t || "").trim());
    return m ? (m[1].toUpperCase() === "ATMOS" ? "ATMOS" : m[1]) : "2D";
  }

  function enhanceTimeline(shows) {
    var tl = $$("div", shows).filter(function (d) {
      return d.classList.contains("no-scrollbar") && d.querySelector(".min-w-\\[960px\\]");
    })[0];
    if (!tl) return;
    set(tl, "data-mv-tl", "");

    var head = $$("div.sticky", tl).filter(function (d) { return d.classList.contains("backdrop-blur"); })[0];
    if (head) {
      set(head, "data-mv-tlhead", "");
      var nameCol = head.querySelector("[data-name-col]") || head.firstElementChild;
      if (nameCol) set(nameCol, "data-mv-tlheadname", "");
    }

    var blocks = $$(".h-7", tl);
    blocks.forEach(function (block) {
      set(block, "data-mv-tlblock", "");
      var row = block.closest("div.grid") || block.parentElement;
      if (row) set(row, "data-mv-tlrow", "");
      var past = block.classList.contains("cursor-not-allowed");
      if (past) set(block, "data-mv-past", "");
      var spans = $$(":scope > span", block);
      var label = spans[1], fmt = spans[2], overlay = spans[0];
      if (label && !block.hasAttribute("data-time")) set(block, "data-time", (label.textContent || "").trim());
      if (fmt) set(block, "data-f", fmtFromText(fmt.textContent));
      if (!past && overlay) {
        var fill = parseFloat(overlay.style.width) / 100 || 0;
        if (!block.hasAttribute("data-occ")) set(block, "data-occ", occByFill(fill));
      }
      var seats = "";
      if (block.tagName === "A" && block.getAttribute("title")) {
        var ms = /(\d+)\s*seats/.exec(block.getAttribute("title") || "");
        if (ms) seats = ms[1];
        block.removeAttribute("title");
      }
      if (seats) set(block, "data-seats", seats);
    });

    var needle = $$("div.pointer-events-none", tl)[0];
    if (needle) set(needle, "data-mv-nowband", "");
  }

  /* --------------------------------- toolbar / section tags */
  function enhanceChrome(shows) {
    var btns = $$("button", shows);

    var tlBtn = btns.filter(function (b) { return /timeline/i.test(b.textContent || ""); })[0];
    if (tlBtn) set(tlBtn.parentElement, "data-mv-toggle", "");

    var sortBtn = btns.filter(function (b) {
      return /^(nearest|earliest|most shows)$/i.test((b.textContent || "").trim());
    })[0];
    if (sortBtn) set(sortBtn.parentElement.parentElement, "data-mv-sort", "");

    var cityBtn = btns.filter(function (b) {
      return /^(chennai|hyderabad|bengaluru|kochi|mumbai)$/i.test((b.textContent || "").trim());
    })[0];
    if (cityBtn) set(cityBtn.parentElement, "data-mv-cities", "");

    var sel = $("select", shows);
    if (sel) set(sel.parentElement, "data-mv-filters", "");

    var dot = $(".bg-emerald-400", shows);
    if (dot) {
      var legend = dot.closest("div");
      if (legend) set(legend, "data-mv-legend", "");
    }

    $$(".mt-8", shows).forEach(function (d) {
      if (d.querySelectorAll("button").length >= 6) set(d, "data-mv-dates", "");
    });

    var areaRow = $$(".pb-1", shows)[0];
    if (areaRow) set(areaRow, "data-mv-areas", "");
  }

  /* ------------------------------------------------ tooltip */
  var tipEl = null, tipOn = false, tipX = 0, tipY = 0;

  function ensureTip() {
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "mv-tip";
      tipEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function fmtClassFmt(f) { return (f || "").toUpperCase(); }

  function renderTip(t) {
    var tip = ensureTip();
    var isPast = t.hasAttribute("data-mv-past");
    var time = t.getAttribute("data-time") || "";
    var fmt = (t.getAttribute("data-f") || "").toUpperCase();
    var occ = t.getAttribute("data-occ") || (isPast ? "past" : "available");
    var price = t.getAttribute("data-price") || "";
    var seats = t.getAttribute("data-seats") || "";

    var occRow;
    if (t.hasAttribute("data-mv-dot") || t.hasAttribute("data-mv-stub") || t.hasAttribute("data-mv-tlblock")) {
      if (isPast) {
        occRow = '<span class="mv-tip-occ-past"><i class="mv-tip-dot"></i>Started — doors closed</span>';
      } else {
        occRow = '<span class="mv-tip-occ mv-tip-occ-' + occ + '"><i class="mv-tip-dot"></i>' +
          (OCC_LABEL[occ] || "Available") + "</span>";
      }
    } else {
      occRow = "";
    }

    var right = [];
    if (price) right.push("₹" + price + "+");
    if (seats) right.push(seats + " seats");
    var rightHtml = right.length ? "<span>" + right.join(" · ") + "</span>" : "";

    tip.innerHTML =
      '<div class="mv-tip-head"><span class="mv-tip-time">' + time +
      '</span>' + (fmt ? '<span class="mv-tip-fmt" data-f="' + fmtClassFmt(fmt) + '">' + fmt + "</span>" : "") + "</div>" +
      (occRow || rightHtml ?
        '<div class="mv-tip-row">' + occRow + rightHtml + "</div>" : "");
  }

  function placeTip(x, y) {
    if (!tipOn || !tipEl) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var r = tipEl.getBoundingClientRect();
    var left = x + 16, top = y - r.height - 16;
    if (top < 12) top = y + 20;
    if (left + r.width > vw - 12) left = vw - r.width - 12;
    tipEl.style.left = Math.max(12, left) + "px";
    tipEl.style.top = Math.max(12, top) + "px";
  }

  function hideTip() {
    if (tipEl) tipEl.classList.remove("on");
    tipOn = false;
  }

  function initTip() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.addEventListener("pointerover", function (e) {
      var t = e.target && e.target.closest &&
        e.target.closest("[data-mv-stub], [data-mv-tlblock], [data-mv-dot]");
      if (!t) return;
      try {
        renderTip(t);
        tipEl.classList.add("on");
        tipOn = true;
        placeTip(e.clientX, e.clientY);
      } catch (err) { hideTip(); }
    }, true);

    document.addEventListener("pointerout", function (e) {
      var from = e.target && e.target.closest &&
        e.target.closest("[data-mv-stub], [data-mv-tlblock], [data-mv-dot]");
      if (from && !(e.relatedTarget && e.relatedTarget.closest &&
        e.relatedTarget.closest("[data-mv-stub], [data-mv-tlblock], [data-mv-dot]") === from)) {
        hideTip();
      }
    }, true);

    document.addEventListener("pointermove", function (e) {
      tipX = e.clientX; tipY = e.clientY;
      if (tipOn) placeTip(tipX, tipY);
    });
  }

  /* ------------------------------------------------- driver */
  var pending = false;

  /* hydration gate: paint attributes + appended leaves ONLY after React
     owns the DOM, so hydration never walks foreign nodes (no #418). */
  var hydratedNow = false;
  function probeHydrated() {
    var probe = $("#shows a.stub") || $("#shows .h-7") || $("#shows article");
    if (!probe) return false;
    for (var k in probe) {
      if (k.indexOf("__reactFiber") === 0 || k.indexOf("__reactProps") === 0) return true;
    }
    return false;
  }
  function onHydrated(ok) {
    var n = 0;
    (function poll() {
      if (probeHydrated() || n > 160) { hydratedNow = true; ok(); return; } // ~10s fallback
      n++;
      setTimeout(poll, 60);
    })();
  }

  function run() {
    pending = false;
    if (!hydratedNow) return;
    try {
      var shows = $("#shows");
      if (!shows) return;
      enhanceChrome(shows);
      enhanceCards(shows);
      enhanceFeatured(shows);
      enhanceTimeline(shows);
    } catch (err) { /* never break the app */ }
  }

  function schedule() {
    if (!pending) {
      pending = true;
      setTimeout(run, 140);
    }
  }

  function boot() {
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: true, attributes: false });
    } catch (err) { /* observer optional */ }
    setInterval(function () {
      if (!hydratedNow) return;
      $$("[data-mv-track]").forEach(function (t) {
        tickNow(t);
      });
    }, 30000);
    initTip();
    onHydrated(function () { schedule(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
