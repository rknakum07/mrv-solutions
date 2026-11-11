(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Video: swap thumbnail for the real video on click ----------
     Set data-video-src on #video to a YouTube/Vimeo embed URL or an .mp4 file. */
  var video = document.getElementById('video');
  if (video) {
    var play = video.querySelector('.video__play');
    play.addEventListener('click', function () {
      var src = video.dataset.videoSrc;
      if (!src) return;
      var el;
      if (/\.(mp4|webm|ogg)(\?|$)/i.test(src)) {
        el = document.createElement('video');
        el.src = src; el.controls = true; el.autoplay = true; el.playsInline = true;
      } else {
        el = document.createElement('iframe');
        el.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
        el.allow = 'autoplay; fullscreen; picture-in-picture';
        el.allowFullscreen = true;
        el.title = 'MRV Solutions introduction video';
      }
      video.innerHTML = '';
      video.appendChild(el);
    });
  }

  /* ---------- Count-up for the stats ---------- */
  var counters = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el) {
    var target = parseInt(el.dataset.count, 10);
    var start = performance.now(), dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Testimonials carousel (arrows are shown on mobile only) ---------- */
  var track = document.getElementById('testimonials-track');
  if (track) {
    var prevBtn = document.querySelector('.carousel__btn[data-dir="-1"]');
    var nextBtn = document.querySelector('.carousel__btn[data-dir="1"]');

    function step() {
      var card = track.querySelector('.t-card');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= max;
    }
    function go(dir) {
      track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    }
    prevBtn.addEventListener('click', function () { go(-1); });
    nextBtn.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(updateArrows); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  /* ---------- Lead form validation ---------- */
  // FormSubmit AJAX endpoint – submissions are emailed to this address
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/vrteam.designs@gmail.com';
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');

  var rules = {
    instagram: function (v) { return /^@?[A-Za-z0-9._]{1,30}$/.test(v) || 'Enter your Instagram handle, for example @yourname.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.'; },
    phone: function (v) { return /^[+()\d][\d\s().-]{6,}$/.test(v) || 'Enter a valid phone number.'; }
  };

  function validateField(input) {
    var rule = rules[input.name];
    var wrap = input.closest('.field');
    var err = wrap.querySelector('.field__error');
    var value = input.value.trim();
    var result = true;
    if (input.required && !value) result = 'This field is required.';
    else if (rule && value) result = rule(value);
    wrap.classList.toggle('field--invalid', result !== true);
    input.setAttribute('aria-invalid', String(result !== true));
    if (err) err.textContent = result === true ? '' : result;
    return result === true;
  }

  if (form) {
    form.querySelectorAll('.field input').forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field--invalid')) validateField(input);
      });
    });

    // grey placeholder look until the user changes a select, then normal text colour
    form.querySelectorAll('select').forEach(function (s) {
      s.addEventListener('change', function () { s.style.color = '#000'; });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      var firstInvalid = null;
      form.querySelectorAll('.field input').forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        status.textContent = 'Please fix the highlighted fields.';
        status.classList.add('is-error');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var data = new FormData(form);

      // Spam honeypot: real visitors never fill this hidden field
      if (data.get('_honey')) return;

      btn.disabled = true;
      status.textContent = 'Sending…';

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      })
        .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
        .then(function (r) {
          if (!r.ok || String(r.body.success) === 'false') throw new Error(r.body.message || 'Request failed');
          form.reset();
          form.querySelectorAll('select').forEach(function (s) { s.style.color = ''; });
          status.textContent = 'Thanks! We’ll be in touch shortly.';
          status.classList.add('is-success');
        })
        .catch(function () {
          status.textContent = 'Something went wrong. Please try again or email us directly.';
          status.classList.add('is-error');
        })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
