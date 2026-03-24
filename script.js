const clock = document.querySelector("#clock");
const year = document.querySelector("#year");
const tiltCards = document.querySelectorAll(".tilt-card");

if (clock) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  });

  const tick = () => {
    clock.textContent = formatter.format(new Date());
  };

  tick();
  window.setInterval(tick, 30000);
}

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateTilt = (card, event) => {
  const bounds = card.getBoundingClientRect();
  const offsetX = event.clientX - bounds.left;
  const offsetY = event.clientY - bounds.top;
  const rotateY = ((offsetX / bounds.width) - 0.5) * 6;
  const rotateX = (0.5 - offsetY / bounds.height) * 6;

  card.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
  card.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
};

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    updateTilt(card, event);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  });
});
