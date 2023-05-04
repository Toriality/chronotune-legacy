import song from "./song.js";
import structure from "./structure.js";

const game = {
  score: 0,
  get song() {
    return song.get();
  },

  init() {
    structure.init(this.confirm.bind(this), this.nextMatch.bind(this));
    structure.createTimeline();
    this.score = 0;
    this.match = 1;
    this.start();
  },

  async start() {
    await song.load();
    console.log(this.song);
    structure.createSongElements(this.song);
    structure.createConfirmButton(this.song);
  },

  async nextMatch() {
    this.match++;
    structure.reset();
    await this.start();
  },

  confirm(score) {
    this.score = this.score + score;
    structure.finishSongFrame(this.song, score);
    structure.finishTimeline(this.song);
    structure.createNextButton();
  },
};

export default game;
