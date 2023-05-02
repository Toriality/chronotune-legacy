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
  let score = 0;

  const songBox = document.querySelector("#songBox");
  const songFrame = document.querySelector("#songFrame");
  const response = await fetch("http://localhost:3700/random");
  const song = await response.json();
  console.log(song);

  songBox.style.backgroundImage = `url(${song.image})`;
  songBox.classList.remove("loading");
  const blurBox = document.createElement("div");
  blurBox.classList.add("blurBox");
  songBox.appendChild(blurBox);

  songFrame.innerHTML = `
    <iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${song.url}?utm_source=generator&theme=0" width="100%" height="100%" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    `;
  songFrame.classList.remove("loading");

  // Button functions
  const confirmButton = document.querySelector("#confirmButton");
  confirmButton.disabled = false;

  confirmButton.addEventListener("click", async () => {
    score = getScore(song);
    confirmButton.disabled = true;
    confirmButton.classList.add("loading");
    confirmButton.textContent = "Next";

    const correctMarker = document.querySelector(`.year[data-year="${song.year}"]`);
    correctMarker.id = "correctMarker";
    const correctYearDialog = document.createElement("div");
    correctYearDialog.classList.add("yearDialog");
    correctYearDialog.id = "correctYearDialog";
    correctYearDialog.innerText = song.year;
    correctMarker.appendChild(correctYearDialog);

    songFrame.classList.add("frameEnd");
    songFrame.innerHTML = `
        <h1>${song.year}</h1>
        <h2>Score: ${score} pts</h2>
        <h3>${song.name}</h3>
        <h4>By ${song.artist}</h4>
    `;

    setTimeout(() => {
      confirmButton.classList.remove("loading");
      confirmButton.disabled = false;
    }, 1000);
  });
});

function getScore(song) {
  const yearInput = slider.dataset.year;
  const yearCorrect = song.year;

  const yearDifference = Math.abs(yearCorrect - yearInput);

  const score = 100 - Math.min(yearDifference * 2, 100);
  return score;
}
