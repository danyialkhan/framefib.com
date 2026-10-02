(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".site-header");
  if (header && !header.classList.contains("is-solid")) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  const revealed = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealed.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealed.forEach((element) => observer.observe(element));
  }

  const gallery = document.querySelector(".gallery");
  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = gallery && gallery.querySelector("li");
      if (!item) return;
      const distance = item.getBoundingClientRect().width + 28;
      gallery.scrollBy({ left: Number(button.dataset.scroll) * distance, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  // "Try a round": guess which of the four stories is true, as in the app's voting screen.
  const round = document.querySelector("[data-round]");
  if (round) {
    const stories = Array.from(round.querySelectorAll(".story"));
    const result = round.querySelector(".play-result");
    const again = round.querySelector("[data-again]");
    const reset = () => {
      stories.forEach((story) => {
        story.disabled = false;
        story.classList.remove("is-truth", "is-picked");
        story.setAttribute("aria-pressed", "false");
        story.querySelector("small").textContent = "";
      });
      result.textContent = "";
      result.classList.remove("win");
      again.hidden = true;
    };
    stories.forEach((story) => {
      story.addEventListener("click", () => {
        const truth = story.dataset.truth === "true";
        stories.forEach((other) => {
          other.disabled = true;
          other.classList.toggle("is-truth", other.dataset.truth === "true");
          other.classList.toggle("is-picked", other === story);
          other.querySelector("small").textContent = other.dataset.truth === "true" ? `The truth · ${other.dataset.author}` : `A fib by ${other.dataset.author}`;
        });
        story.setAttribute("aria-pressed", "true");
        result.textContent = truth
          ? "You found the truth: +2 points. Maya really did frost it while it was still warm."
          : `Fooled! ${story.dataset.author} earns +1 point for that fib. Maya frosted it while it was still warm.`;
        result.classList.toggle("win", truth);
        again.hidden = false;
        again.focus({ preventScroll: true });
      });
    });
    again.addEventListener("click", () => {
      reset();
      stories[0].focus();
    });
  }
})();
