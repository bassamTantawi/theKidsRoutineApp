export function createStarLayer() {
  const starLayer = document.createElement("div");
  starLayer.className = "pointer-events-none fixed inset-0 z-[60]";
  document.body.appendChild(starLayer);
  return starLayer;
}

export function sprinkleStars(target: HTMLElement, starLayer: HTMLElement | null) {
  if (!starLayer) return;

  const rect = target.getBoundingClientRect();
  const count = 14;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "★";

    const spreadX = (Math.random() - 0.5) * rect.width;
    const spreadY = (Math.random() - 0.5) * rect.height;

    // starLayer is position:fixed, so use viewport coords (no scroll offsets needed)
    star.style.left = `${rect.left + rect.width / 2 + spreadX}px`;
    star.style.top = `${rect.top + rect.height / 2 + spreadY}px`;
    star.style.animationDelay = `${Math.random() * 120}ms`;

    starLayer.appendChild(star);
    setTimeout(() => star.remove(), 1000);
  }
}

