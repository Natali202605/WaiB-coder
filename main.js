(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* Переключение темы */
  var themeButtons = document.querySelectorAll("[data-theme-set]");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    themeButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme-set") === theme;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  var savedTheme = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(savedTheme);

  themeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(btn.getAttribute("data-theme-set"));
    });
  });

  function revealAll() {
    document.querySelectorAll(".scroll-reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".badge-wave").forEach(function (el) {
      el.classList.add("is-wave-visible");
    });
  }

  /* Scroll reveal */
  if (!prefersReduced) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    document.querySelectorAll(".scroll-reveal").forEach(function (el) {
      var delay = el.getAttribute("data-reveal-delay");
      if (delay) {
        el.style.setProperty("--scroll-reveal-delay", delay + "ms");
      }
      observer.observe(el);
    });
  } else {
    revealAll();
  }

  /* Пустые превью проектов */
  document.querySelectorAll(".project__img").forEach(function (img) {
    function markEmpty() {
      var media = img.closest(".project__media");
      if (media) media.classList.add("is-empty");
    }

    if (img.complete && img.naturalWidth === 0) {
      markEmpty();
    }

    img.addEventListener("error", markEmpty);
  });

  var header = document.querySelector(".site-header");
  var progressBar = document.querySelector(".scroll-progress__bar");
  var heroPhoto = document.querySelector(".hero__photo-frame");
  var stepsFill = document.querySelector(".steps__progress-fill");
  var steps = document.querySelectorAll(".step");
  var navLinks = document.querySelectorAll(".nav a[data-nav-target]");
  var navSections = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute("data-nav-target");
    var section = document.getElementById(id);
    if (section) {
      navSections.push({ id: id, el: section, link: link });
    }
  });

  /* Активная навигация */
  if (navSections.length && !prefersReduced) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("data-nav-target") === id
            );
          });
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -45% 0px",
        threshold: 0,
      }
    );

    navSections.forEach(function (item) {
      navObserver.observe(item.el);
    });
  } else if (navSections.length) {
    navLinks[0] && navLinks[0].classList.add("is-active");
  }

  /* Прогресс шагов */
  function updateStepsProgress() {
    if (!stepsFill || !steps.length) return;

    var active = 0;
    var trigger = window.innerHeight * 0.62;

    steps.forEach(function (step, i) {
      var rect = step.getBoundingClientRect();
      var mid = rect.top + rect.height * 0.4;
      if (mid < trigger) {
        active = i + 1;
      }
      step.classList.toggle("is-active", i < active);
    });

    if (active === 0 && steps[0]) {
      var first = steps[0].getBoundingClientRect();
      if (first.top < window.innerHeight) active = 1;
    }

    var pct = (active / steps.length) * 100;
    stepsFill.style.height = pct + "%";
  }

  /* Волна бейджей */
  var stackSection = document.getElementById("stack");
  if (stackSection && !prefersReduced) {
    var badgeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          stackSection.querySelectorAll(".badge-wave").forEach(function (badge) {
            var delay = badge.getAttribute("data-wave-delay") || "0";
            badge.style.setProperty("--wave-delay", delay + "ms");
            badge.classList.add("is-wave-visible");
          });
          badgeObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    badgeObserver.observe(stackSection);
  } else if (stackSection) {
    stackSection.querySelectorAll(".badge-wave").forEach(function (b) {
      b.classList.add("is-wave-visible");
    });
  }

  /* Tilt проектов + spotlight */
  var projectsGrid = document.querySelector(".projects-grid");
  var projects = document.querySelectorAll(".project");

  if (finePointer && !prefersReduced && projects.length) {
    projects.forEach(function (project) {
      var media = project.querySelector(".project__media");

      project.addEventListener("mouseenter", function () {
        if (projectsGrid) projectsGrid.classList.add("has-focus");
        project.classList.add("is-hovered");
      });

      project.addEventListener("mouseleave", function () {
        project.classList.remove("is-hovered");
        if (media) {
          media.style.transform = "";
        }
        if (projectsGrid && !projectsGrid.querySelector(".project:is(:hover)")) {
          projectsGrid.classList.remove("has-focus");
        }
      });

      project.addEventListener("mousemove", function (e) {
        if (!media) return;
        var rect = project.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotateY = x * 10;
        var rotateX = -y * 8;
        media.style.transform =
          "perspective(900px) rotateX(" +
          rotateX +
          "deg) rotateY(" +
          rotateY +
          "deg) scale(1.03)";
      });
    });

    if (projectsGrid) {
      projectsGrid.addEventListener("mouseleave", function () {
        projectsGrid.classList.remove("has-focus");
        projects.forEach(function (p) {
          p.classList.remove("is-hovered");
          var m = p.querySelector(".project__media");
          if (m) m.style.transform = "";
        });
      });
    }
  }

  /* Карусель отзывов */
  var reviewsRoot = document.querySelector("[data-reviews-slider]");
  if (reviewsRoot) {
    var reviewsTrack = reviewsRoot.querySelector("[data-reviews-track]");
    var reviewSlides = reviewsRoot.querySelectorAll(".review");
    var reviewsPrev = reviewsRoot.querySelector("[data-reviews-prev]");
    var reviewsNext = reviewsRoot.querySelector("[data-reviews-next]");
    var reviewsCounter = reviewsRoot.querySelector("[data-reviews-counter]");
    var reviewsDots = reviewsRoot.querySelectorAll("[data-reviews-dot]");
    var reviewsViewport = reviewsRoot.querySelector("[data-reviews-viewport]");
    var reviewIndex = 0;
    var reviewTotal = reviewSlides.length;
    var touchStartX = 0;

    function padReviewNum(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function setReviewSlide(index) {
      if (!reviewTotal || !reviewsTrack) return;

      reviewIndex = (index + reviewTotal) % reviewTotal;
      reviewsTrack.style.transform = "translate3d(-" + reviewIndex * 100 + "%, 0, 0)";

      if (reviewsCounter) {
        reviewsCounter.textContent =
          padReviewNum(reviewIndex + 1) + " / " + padReviewNum(reviewTotal);
      }

      reviewSlides.forEach(function (slide, i) {
        var isActive = i === reviewIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      reviewsDots.forEach(function (dot, i) {
        var active = i === reviewIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
        dot.setAttribute("tabindex", active ? "0" : "-1");
      });
    }

    function stepReview(delta) {
      setReviewSlide(reviewIndex + delta);
    }

    if (reviewsPrev) {
      reviewsPrev.addEventListener("click", function () {
        stepReview(-1);
      });
    }

    if (reviewsNext) {
      reviewsNext.addEventListener("click", function () {
        stepReview(1);
      });
    }

    reviewsDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = parseInt(dot.getAttribute("data-reviews-dot"), 10);
        if (!isNaN(target)) setReviewSlide(target);
      });
    });

    if (reviewsViewport) {
      reviewsViewport.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepReview(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          stepReview(1);
        }
      });

      reviewsViewport.addEventListener(
        "touchstart",
        function (e) {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      reviewsViewport.addEventListener(
        "touchend",
        function (e) {
          var diff = e.changedTouches[0].screenX - touchStartX;
          if (Math.abs(diff) < 48) return;
          stepReview(diff > 0 ? -1 : 1);
        },
        { passive: true }
      );
    }

    if (prefersReduced && reviewsTrack) {
      reviewsTrack.classList.add("is-instant");
    }

    setReviewSlide(0);
  }

  function onScroll() {
    var scrollY = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = progress + "%";
    }

    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 24);
    }

    if (heroPhoto && !prefersReduced && scrollY < window.innerHeight) {
      heroPhoto.style.transform =
        "rotate(" + (2 - scrollY * 0.006) + "deg) translateY(" + scrollY * -0.03 + "px)";
    }

    updateStepsProgress();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Кастомный курсор */
  if (finePointer && !prefersReduced) {
    var cursor = document.getElementById("cursor");
    var pos = { x: 0, y: 0 };
    var current = { x: 0, y: 0 };
    var visible = false;

    document.addEventListener(
      "mousemove",
      function (e) {
        pos.x = e.clientX;
        pos.y = e.clientY;
        if (!visible && cursor) {
          visible = true;
          cursor.classList.add("is-active");
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      if (cursor) cursor.classList.remove("is-active");
      visible = false;
    });

    var hoverTargets =
      "a, button, .btn, .card, .project, .badge, .step, .theme-switch__btn, .reviews-slider__btn, .reviews-slider__dot, .theme-switch";
    document.querySelectorAll(hoverTargets).forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (cursor) cursor.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        if (cursor) cursor.classList.remove("is-hover");
      });
    });

    function tick() {
      current.x += (pos.x - current.x) * 0.18;
      current.y += (pos.y - current.y) * 0.18;

      if (cursor) {
        cursor.style.transform =
          "translate3d(" + current.x + "px," + current.y + "px,0)";
      }

      requestAnimationFrame(tick);
    }

    tick();
  }
})();
