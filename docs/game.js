import song from "./song.js";
import structure from "./structure.js";

const game = {
  score: 0,
  get song() {
    return song.get();
  },

  init() {
    console.log("Game initialized");
    structure.init(this.confirm.bind(this), this.nextMatch.bind(this));
    structure.createTimeline();
    this.score = 0;
    this.match = 1;
    this.start();
  },

  async start() {
    console.log("Game started");
    await song.load();
    console.log(this.song);
    structure.createSongElements(this.song);
    structure.createConfirmButton(this.song);
  },

  async nextMatch() {
    console.log(`Match ${this.match}`);
    this.match++;
    structure.reset();
    await this.start();
  },

  confirm(score) {
    console.log(`Score ${score}`);
    this.score = this.score + score;
    structure.finishSongFrame(this.song, score);
    structure.finishTimeline(this.song);
    structure.createNextButton();
  },
};

export default game;
