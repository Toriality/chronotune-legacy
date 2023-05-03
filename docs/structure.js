const START_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();
const TOTAL_YEARS = CURRENT_YEAR - START_YEAR + 1;

let timeline = document.querySelector("#timeline");
let slider = document.querySelector("#timelineSlider");
let markers = null;
let songBox = document.querySelector("#songBox");
let songFrame = document.querySelector("#songFrame");
let confirmButton = document.querySelector("#confirmButton");

const structure = {
  reset() {
    slider.style.let = "0px";
    song.style.backgroundImage = undefined;
    songFrame.innerHTML = "";
  },

  createTimeline() {
    let isDragging = false;
    let startOffset = 0;
    let startX = 0;

    timeline = document.querySelector("#timeline");
    slider = document.querySelector("#timelineSlider");

    // Create year dialog above slider
    const yearDialog = document.createElement("div");
    yearDialog.classList.add("yearDialog");
    slider.appendChild(yearDialog);

    // Create year markers
    for (let i = 0; i < TOTAL_YEARS; i++) {
      const year = document.createElement("div");
      year.classList.add("year");
      year.dataset.year = START_YEAR + i;
      year.style.left = `${(i / (TOTAL_YEARS - 1)) * 100}%`;
      timeline.appendChild(year);
    }
    markers = document.querySelectorAll(".year");

    // Configure year dialog's default string
    updateYearDialog();

    // Slider mouse events
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
  },

  createSongElements(song) {
    songBox = document.querySelector("#songBox");
    songFrame = document.querySelector("#songFrame");

    // Create song box and blur effect
    songBox.style.backgroundImage = `url(${song.image})`;
    const blurBox = document.createElement("div");
    blurBox.classList.add("blurBox");
    songBox.appendChild(blurBox);

    // Configure song frame
    songFrame.innerHTML = `
        <iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${song.url}?utm_source=generator&theme=0" width="100%" height="100%" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        `;

    // Remove loading class
    songBox.classList.remove("loading");
    songFrame.classList.remove("loading");
  },

  createConfirmButton: (song, confirm) => {
    confirmButton.disabled = false;
    confirmButton = document.querySelector("#confirmButton");
    confirmButton.addEventListener("click", () => {
      confirmButton.disabled = true;
      confirmButton.classList.add("loading");
      const score = calculateScore(song);
      confirm(score);
    });

    function calculateScore(song) {
      const yearInput = slider.dataset.year;
      const yearCorrect = song.year;
      const yearDifference = Math.abs(yearCorrect - yearInput);
      const score = 100 - Math.min(yearDifference * 2, 100);
      return score;
    }
  },

  createNextButton(nextMatch) {
    confirmButton.id = "nextButton";
    confirmButton.innerText = "Next song";
    confirmButton.disabled = false;
    confirmButton.addEventListener("click", () => {
      confirmButton.disabled = true;
      confirmButton.classList.add("loading");
      nextMatch();
    });
  },

  finishSongFrame(song, score) {
    songFrame.classList.add("frameEnd");
    songFrame.innerHTML = `
        <h1>${song.year}</h1>
        <h2>Score: ${score} pts</h2>
        <h3>${song.name}</h3>
        <h4>By ${song.artist}</h4>
    `;
  },

  finishTimeline(song) {
    const correctMarker = document.querySelector(`.year[data-year="${song.year}"]`);
    correctMarker.id = "correctMarker";
    const correctYearDialog = document.createElement("div");
    correctYearDialog.classList.add("yearDialog");
    correctYearDialog.id = "correctYearDialog";
    correctYearDialog.innerText = song.year;
    correctMarker.appendChild(correctYearDialog);
  },
};

export default structure;
