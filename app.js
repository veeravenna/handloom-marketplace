/**
 * Handloom Marketplace - Main Application JavaScript
 * A craft-first marketplace for authentic handloom products
 */

(function () {
  "use strict";

  // DOM Elements
  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelector(".nav-links");

  // ==================================
  // Theme Management
  // ==================================
  const THEME_KEY = "handloom-theme";

  const themeIcons = {
    dark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    light: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  };

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    if (themeToggle) {
      themeToggle.innerHTML = theme === "dark" ? themeIcons.light : themeIcons.dark;
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "light";
    setTheme(current === "dark" ? "light" : "dark");
  }

  // ==================================
  // Mobile Navigation
  // ==================================
  function toggleMobileMenu() {
    if (navLinks) {
      navLinks.classList.toggle("nav-open");
    }
    const expanded = navLinks?.classList.contains("nav-open") || false;
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", String(expanded));
    }
  }

  function closeMobileMenu() {
    if (navLinks) {
      navLinks.classList.remove("nav-open");
    }
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
    }
  }

  // ==================================
  // Scroll Progress Indicator
  // ==================================
  function updateScrollProgress() {
    const scrollProgress = document.querySelector(".scroll-progress");
    if (!scrollProgress) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = `${Math.min(progress, 100)}%`;
  }

  // ==================================
  // Intersection Observer for Animations
  // ==================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll("[data-animate]");
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  // ==================================
  // Filter Chips (for collections page)
  // ==================================
  function initFilterChips() {
    const chips = document.querySelectorAll(".filter-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        // Remove active from siblings
        chip.parentElement.querySelectorAll(".filter-chip").forEach((c) => {
          c.classList.remove("active");
        });
        chip.classList.add("active");

        // Dispatch custom event for product filtering
        document.dispatchEvent(
          new CustomEvent("filter-change", {
            bubbles: true,
            detail: { filter: chip.dataset.filter || chip.textContent.toLowerCase() },
          })
        );
      });
    });
  }

  // ==================================
  // Smooth Scroll for Anchor Links
  // ==================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#") return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          closeMobileMenu();
        }
      });
    });
  }

  // ==================================
  // Contact Form Handling
  // ==================================
  function initContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // Simulate form submission
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = "Message sent!";
        submitBtn.style.background = "var(--color-secondary)";

        setTimeout(() => {
          form.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = "";
        }, 3000);
      }, 1500);
    });
  }

  // ==================================
  // Product Quantity Counter
  // ==================================
  function initQuantityCounter() {
    const counters = document.querySelectorAll(".quantity-control");
    counters.forEach((control) => {
      const minusBtn = control.querySelector(".qty-minus");
      const plusBtn = control.querySelector(".qty-plus");
      const input = control.querySelector(".qty-input");

      minusBtn?.addEventListener("click", () => {
        const val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });

      plusBtn?.addEventListener("click", () => {
        const val = parseInt(input.value) || 0;
        input.value = val + 1;
      });
    });
  }

  // ==================================
  // Header Scroll Effect
  // ==================================
  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;

      if (currentScroll > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      lastScroll = currentScroll;
      updateScrollProgress();
    }, { passive: true });
  }

  // ==================================
  // Product Wishlist
  // ==================================
  const WISHLIST_KEY = "handloom-wishlist";

  function toggleWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    const index = wishlist.indexOf(productId);

    if (index === -1) {
      wishlist.push(productId);
    } else {
      wishlist.splice(index, 1);
    }

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));

    // Update button state
    const btn = document.querySelector(`[data-product-id="${productId}"]`);
    if (btn) {
      btn.classList.toggle("wishlist-active");
      const icon = btn.querySelector("svg");
      if (icon) {
        icon.style.fill = wishlist.includes(productId) ? "currentColor" : "none";
      }
    }

    return wishlist;
  }

  function initWishlistButtons() {
    document.querySelectorAll(".wishlist-btn").forEach((btn) => {
      const productId = btn.dataset.productId;
      const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");

      if (wishlist.includes(productId)) {
        btn.classList.add("wishlist-active");
        const icon = btn.querySelector("svg");
        if (icon) icon.style.fill = "currentColor";
      }

      btn.addEventListener("click", () => toggleWishlist(productId));
    });
  }

  // ==================================
  // Image Lazy Loading
  // ==================================
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  // ==================================
  // Search Functionality
  // ==================================
  function initSearch() {
    const searchInput = document.querySelector("#search-input");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();

      // Filter products
      document.querySelectorAll(".product-card").forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? "" : "none";
      });
    });
  }

  // ==================================
  // Toast Notifications
  // ==================================
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "alert");

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("toast-visible");
    });

    setTimeout(() => {
      toast.classList.remove("toast-visible");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ==================================
  // Initialize Everything
  // ==================================
  function init() {
    // Theme
    setTheme(getPreferredTheme());
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    // Mobile menu
    if (menuBtn) {
      menuBtn.addEventListener("click", toggleMobileMenu);
      menuBtn.setAttribute("aria-expanded", "false");
    }

    // Close mobile menu on link click
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    // Initialize all features
    initScrollAnimations();
    initFilterChips();
    initSmoothScroll();
    initContactForm();
    initQuantityCounter();
    initHeaderScroll();
    initWishlistButtons();
    initLazyLoading();
    initSearch();

    // Console branding
    console.log(
      "%c Handloom Marketplace ",
      "background: var(--color-primary); color: var(--color-text-inverse); padding: 4px 8px; border-radius: 4px;"
    );
    console.log("Built with passion for artisan communities.");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose utilities globally
  window.Handloom = {
    toggleTheme,
    setTheme,
    toggleWishlist,
    showToast,
  };
})();
