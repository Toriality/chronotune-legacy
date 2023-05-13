import song from "./song.js";
import structure from "./structure.js";

const MAX_MATCHES = 5;

const game = {
  score: 0,
  match: 1,
  get song() {
    return song.get();
  },

  async init() {
    structure.init(this.confirm.bind(this), this.nextMatch.bind(this));
    structure.createTimeline();
    this.score = 0;
    this.match = 1;
    await this.start();
  },

  async start() {
    await song.load();
    console.log(this.song);
    structure.createSongElements(this.song);
    structure.createConfirmButton(this.song);
  },

  async finish() {
    song.unload();
    structure.createFinish(this.score);
  },

  async nextMatch() {
    this.match++;
    structure.reset();
    if (this.match <= MAX_MATCHES) return await this.start();
    else return await this.finish();
  },

  confirm(score) {
    this.score = this.score + score;
    structure.finishSongFrame(this.song, score);
    structure.finishTimeline(this.song);
    structure.createNextButton();
  },
};

game.init();

const toggles = document.querySelectorAll(".toggle");
toggles.forEach((toggle) => {
  const content = document.getElementById(toggle.dataset.content);
  toggle.addEventListener("click", () => {
    content.classList.toggle("hide");
  });

  document.addEventListener("mousedown", (e) => {
    if (!toggle.contains(e.target) && !content.contains(e.target)) {
      content.classList.add("hide");
    }
  });
});

export default game;
