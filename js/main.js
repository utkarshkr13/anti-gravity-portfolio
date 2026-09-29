document.documentElement.classList.add("js");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function closeNavigation() {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const nextState = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(nextState));
    siteNav.classList.toggle("is-open", nextState);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) closeNavigation();
  });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const revealItems = [...document.querySelectorAll("[data-reveal]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}
