// Slider functions
const timeline = document.querySelector("#timeline");
const slider = document.querySelector("#timelineSlider");
let isDragging = false;
let startOffset = 0;
let startX = 0;

const START_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();
const TOTAL_YEARS = CURRENT_YEAR - START_YEAR + 1;
for (let i = 0; i < TOTAL_YEARS; i++) {
  const year = document.createElement("div");
  year.classList.add("year");
  year.dataset.year = START_YEAR + i;
  year.style.left = `${(i / (TOTAL_YEARS - 1)) * 100}%`;
  timeline.appendChild(year);
}

const markers = document.querySelectorAll(".year");

const yearDialog = document.createElement("div");
yearDialog.classList.add("yearDialog");
slider.appendChild(yearDialog);

slider.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startOffset = slider.offsetLeft - timeline.offsetLeft;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    let newPosition = startOffset + e.clientX - startX;
    if (newPosition >= 0 && newPosition <= timeline.offsetWidth) {
      slider.style.left = `${newPosition}px`;
      updateYearDialog();
    }
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

updateYearDialog();

function updateYearDialog() {
  const sliderRect = slider.getBoundingClientRect();
  const sliderX = sliderRect.x + sliderRect.width / 2;
  let nearestYearMarker = null;
  let nearestDistance = Infinity;

  markers.forEach((marker) => {
    const markerRect = marker.getBoundingClientRect();
    const markerX = markerRect.x + markerRect.width / 2;
    const distance = Math.abs(sliderX - markerX);

    if (distance < nearestDistance) {
      nearestYearMarker = marker;
      nearestDistance = distance;
    }
  });

  if (nearestYearMarker) {
    yearDialog.innerText = nearestYearMarker.dataset.year;
    slider.dataset.year = nearestYearMarker.dataset.year;
  }
}

// Spotify functions
document.addEventListener("DOMContentLoaded", async () => {
  const songBox = document.querySelector("#songBox");
  const songFrame = document.querySelector("#songFrame");
  const response = await fetch("http://localhost:3700/random");
  const song = await response.json();

  songBox.style.backgroundImage = `url(${song.image})`;
  songBox.classList.remove("loading");
  const blurBox = document.createElement("div");
  blurBox.classList.add("blurBox");
  songBox.appendChild(blurBox);

  songFrame.innerHTML = `
    <iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${song.url}?utm_source=generator&theme=0" width="100%" height="100%" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    `;
  songFrame.classList.remove("loading");
});
