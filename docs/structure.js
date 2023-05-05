const START_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();
const TOTAL_YEARS = CURRENT_YEAR - START_YEAR + 1;

let timeline = document.querySelector("#timeline");
let slider = document.querySelector("#timelineSlider");
let markers = null;
let correctMarker = null;
let correctYearDialog = null;
let songBox = document.querySelector("#songBox");
let songFrame = document.querySelector("#songFrame");
let confirmButton = document.querySelector("#confirmButton");
let nextButton = document.querySelector("#nextButton");
let blurBox = null;
let audio = new Audio();

const structure = {
  confirm: null,
  nextMatch: null,
  events: null,
  pausedEvents: null,
  addEventListener: null,
  removeEventListener: null,
  pauseEventListener: null,
  resumeEventListener: null,

  init(confirm, nextMatch) {
    this.confirm = confirm;
    this.nextMatch = nextMatch;
    this.confirm, this.nextMatch;
    this.events = new Map();
    this.pausedEvents = new Map();
    this.addEventListener = function (element, event, id, callback) {
      this.events.set(id, callback);
      element.addEventListener(event, callback);
    };
    this.removeEventListener = function (element, event, id) {
      element.removeEventListener(event, this.events.get(id));
      this.events.delete(id);
    };
    this.pauseEventListener = function (element, event, id) {
      element.removeEventListener(event, this.events.get(id));
      this.pausedEvents.set(id, this.events.get(id));
      this.events.delete(id);
    };
    this.resumeEventListener = function (element, event, id) {
      this.events.set(id, this.pausedEvents.get(id));
      element.addEventListener(event, this.pausedEvents.get(id));
      this.pausedEvents.delete(id);
    };
  },

  reset() {
    slider.style.left = "calc(50% - 25px)";
    songBox.classList.add("loading");
    songBox.style.backgroundImage = "";
    songFrame.classList.remove("frameEnd");
    songFrame.classList.add("loading");
    songFrame.innerHTML = "";
    songFrame.style.backgroundColor = "";
    confirmButton.disabled = true;
    nextButton.disabled = true;
    correctMarker.id = "";
    correctYearDialog.remove();
    blurBox.remove();
    this.resumeEventListener(slider, "mousedown", "sliderMouseDown");
    this.resumeEventListener(document, "mousemove", "sliderMouseMove");
    this.resumeEventListener(document, "mouseup", "sliderMouseUp");
    audio.src = "";
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
    this.addEventListener(slider, "mousedown", "sliderMouseDown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startOffset = slider.offsetLeft - timeline.offsetLeft;
    });

    this.addEventListener(document, "mousemove", "sliderMouseMove", (e) => {
      if (isDragging) {
        let newPosition = startOffset + e.clientX - startX;
        if (newPosition >= 0 && newPosition <= timeline.offsetWidth) {
          slider.style.left = `${newPosition}px`;
          updateYearDialog();
        }
      }
    });

    this.addEventListener(document, "mouseup", "sliderMouseUp", () => {
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
    blurBox = document.createElement("div");
    blurBox.classList.add("blurBox");
    songBox.appendChild(blurBox);

    // Configure song frame
    songFrame.style.backgroundColor = randomRGB();
    songFrame.innerHTML = "<h1>Click here to play</h1>";

    // Remove loading class
    songBox.classList.remove("loading");
    songFrame.classList.remove("loading");

    audio.src = song.url;
    audio.volume = 0.5;
    this.addEventListener(songFrame, "click", "songFrameClick", () => {
      if (audio.paused) {
        songFrame.innerHTML = "";
        audio.play();
        const h1 = document.createElement("h1");
        const songTime = document.createElement("div");
        h1.innerText = `Playing now: "${song.name}"`;
        songTime.style.backgroundColor = randomRGB();
        songTime.id = "songTime";
        songFrame.appendChild(h1);
        songFrame.appendChild(songTime);
      } else {
        songFrame.innerHTML = "";
        audio.pause();
        audio.currentTime = 0;
        songFrame.innerHTML = `<h1>Click here to play</h1>`;
      }
    });

    this.addEventListener(audio, "ended", "audioEnded", () => {
      songFrame.innerHTML = `<h1>Click here to play</h1>`;
    });

    this.addEventListener(audio, "timeupdate", "audioTimeUpdate", () => {
      const songTime = document.querySelector("#songTime");
      if (songTime) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        songTime.style.width = `${percentage}%`;
      }
    });

    function randomRGB() {
      const rgb = Array.from({ length: 3 }, () => Math.floor(Math.random() * 255));
      if (Math.max(...rgb) - Math.min(...rgb) < 128) {
        return randomRGB();
      }
      return `rgb(${rgb.join(", ")})`;
    }
  },

  createConfirmButton(song) {
    nextButton.classList.add("hide");
    confirmButton.classList.remove("hide");
    confirmButton.classList.remove("loading");
    confirmButton.disabled = false;
    confirmButton = document.querySelector("#confirmButton");
    confirmButton.addEventListener(
      "click",
      async function () {
        confirmButton.disabled = true;
        confirmButton.classList.add("loading");
        const score = calculateScore(song);
        await this.confirm(score);
      }.bind(this),
      { once: true }
    );

    function calculateScore(song) {
      const yearInput = slider.dataset.year;
      const yearCorrect = song.year;
      const yearDifference = Math.abs(yearCorrect - yearInput);
      const score = 100 - Math.min(yearDifference * 2, 100);
      return score;
    }
  },

  createNextButton() {
    confirmButton.classList.add("hide");
    nextButton.classList.remove("hide");
    nextButton.classList.remove("loading");
    nextButton.disabled = false;
    nextButton.addEventListener(
      "click",
      async function () {
        nextButton.disabled = true;
        nextButton.classList.add("loading");
        await this.nextMatch();
      }.bind(this),
      { once: true }
    );
  },

  finishSongFrame(song, score) {
    this.removeEventListener(songFrame, "click", "songFrameClick");
    this.removeEventListener(audio, "ended", "audioEnded");
    this.removeEventListener(audio, "timeupdate", "audioTimeUpdate");
    this.pauseEventListener(slider, "mousedown", "sliderMouseDown");
    this.pauseEventListener(document, "mousemove", "sliderMouseMove");
    this.pauseEventListener(document, "mouseup", "sliderMouseUp");
    songFrame.classList.add("frameEnd");
    songFrame.innerHTML = `
        <h1>${song.year}</h1>
        <h2>Score: ${score} pts</h2>
        <h3>${song.name}</h3>
        <h4>By ${song.artist}</h4>
    `;
  },

  finishTimeline(song) {
    correctMarker = document.querySelector(`.year[data-year="${song.year}"]`);
    correctMarker.id = "correctMarker";
    correctYearDialog = document.createElement("div");
    correctYearDialog.classList.add("yearDialog");
    correctYearDialog.id = "correctYearDialog";
    correctYearDialog.innerText = song.year;
    correctMarker.appendChild(correctYearDialog);
  },

  createFinish(score) {
    let highestScore = localStorage.getItem("highestScore");

    if (!highestScore || score > parseInt(highestScore)) {
      localStorage.setItem("highestScore", score);
      highestScore = score;
    }

    songFrame.innerHTML = `
        <h1>Congratulations!</h1>
        <h2>You scored ${score} pts</h2>
        <h3>Highest score: ${highestScore} pts</h3>
    `;
    songFrame.classList.remove("loading");

    songBox.style.background = "red";
    songBox.classList.remove("loading");
  },
};

export default structure;