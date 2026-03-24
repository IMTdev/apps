document.addEventListener("DOMContentLoaded", () => {
  const links = Array.from(document.querySelectorAll("#toc a"));
  const targets = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });
  };

  const updateTocOnScroll = () => {
    const threshold = 160;
    let current = targets[0] ? targets[0].id : "";

    targets.forEach((target) => {
      const top = target.getBoundingClientRect().top;
      if (top <= threshold) current = target.id;
    });

    if (current) setActive(current);
  };

  window.addEventListener("scroll", updateTocOnScroll, { passive: true });
  window.addEventListener("resize", updateTocOnScroll);
  updateTocOnScroll();
});
