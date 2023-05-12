const sections = document.querySelectorAll(".section");
const forward = document.querySelector("#forward");
const back = document.querySelector("#back");
let currentSection = 0;

forward.addEventListener("click", () => {
  currentSection++;
  if (currentSection > sections.length - 1) {
    currentSection = sections.length - 1;
  }
  sections[currentSection - 1].classList.remove("active");
  sections[currentSection].classList.add("active");
});

back.addEventListener("click", () => {
  currentSection--;
  if (currentSection < 0) {
    currentSection = 0;
  }
  sections[currentSection + 1].classList.remove("active");
  sections[currentSection].classList.add("active");
});

const titleScreen = document.createElement("div");
titleScreen.id = "loadedTitleScreen";
const source = localStorage.getItem("source");
titleScreen.innerHTML = source;
const titleScreenBackground = titleScreen.querySelector("#titleScreenBackground");
const tsMusic = titleScreenBackground.querySelectorAll(".tsMusic");
tsMusic.forEach((component) => {
  component.style.animation = "";
});

document.body.appendChild(titleScreen);
