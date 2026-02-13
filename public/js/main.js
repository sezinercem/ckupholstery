document.addEventListener("DOMContentLoaded", function () {
  // ===== Hamburger Menu =====
  var hamburger = document.getElementById("hamburger-menu");
  var nav = document.querySelector("header nav");
  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
      });
    });
  }

  // ===== Header Shrink on Scroll =====
  var header = document.querySelector("header");
  if (header) {
    var shrinkThreshold = 60;
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > shrinkThreshold) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      },
      { passive: true }
    );
  }

  // ===== Scroll Reveal (IntersectionObserver) =====
  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReduced && "IntersectionObserver" in window) {
    // Animate individual [data-animate] elements
    var animateEls = document.querySelectorAll("[data-animate]");
    var animateObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            animateObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    animateEls.forEach(function (el) {
      animateObserver.observe(el);
    });

    // Stagger children of [data-stagger] containers
    var staggerEls = document.querySelectorAll("[data-stagger]");
    var staggerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var children = entry.target.children;
            for (var i = 0; i < children.length; i++) {
              children[i].style.animationDelay = i * 0.12 + "s";
              children[i].classList.add("is-visible");
            }
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    staggerEls.forEach(function (el) {
      staggerObserver.observe(el);
    });
  } else {
    // No IntersectionObserver or reduced motion — show everything
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll("[data-stagger]").forEach(function (el) {
      for (var i = 0; i < el.children.length; i++) {
        el.children[i].classList.add("is-visible");
      }
    });
  }

  // ===== Hero Slideshow =====
  var slides = document.querySelectorAll(".hero-slideshow .slide");
  if (slides.length > 1) {
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, 4000);
  }

  // ===== Fabric Slideshow =====
  var fabricSlides = document.querySelectorAll(".fabrics-slide");
  if (fabricSlides.length > 1) {
    var fIdx = 0;
    setInterval(function () {
      fabricSlides[fIdx].classList.remove("active");
      fIdx = (fIdx + 1) % fabricSlides.length;
      fabricSlides[fIdx].classList.add("active");
    }, 3000);
  }
});
