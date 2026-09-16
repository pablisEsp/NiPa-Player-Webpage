// Shared behaviour for every marketing page: navbar scroll state, mobile menu,
// scroll-in animations and smooth anchor scrolling. Every hook is optional so
// the same file can be loaded on pages that lack some of the markup.
(function () {
  'use strict';

  // Navbar scroll effect
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // Scroll animations (Intersection Observer), staggered inside grids
  var animated = document.querySelectorAll('.animate-on-scroll');
  if (animated.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = Number(entry.target.dataset.delay || 0);
        setTimeout(function () { entry.target.classList.add('visible'); }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    var staggered = ['features-grid', 'bento', 'stats-row', 'pricing-grid'];
    animated.forEach(function (el) {
      var parent = el.parentElement;
      if (parent && staggered.some(function (c) { return parent.classList.contains(c); })) {
        var siblings = Array.prototype.filter.call(parent.children, function (c) {
          return c.classList.contains('animate-on-scroll');
        });
        el.dataset.delay = siblings.indexOf(el) * 100;
      }
      observer.observe(el);
    });
  } else {
    animated.forEach(function (el) { el.classList.add('visible'); });
  }

  // Mobile nav toggle — fullscreen menu
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');
  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    if (navLinks) navLinks.classList.toggle('nav-menu-open', open);
    if (navToggle) navToggle.textContent = open ? '\u2715' : '\u2630';
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () { setMenu(!menuOpen); });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { if (menuOpen) setMenu(false); });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && menuOpen) setMenu(false);
    });
  }

  // Smooth scroll for same-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
