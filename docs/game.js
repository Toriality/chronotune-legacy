import song from "./song.js";
import structure from "./structure.js";

const game = {
  score: 0,
  get song() {
    return song.get();
  },

  init() {
    structure.createTimeline();
    this.start();
  },

  async start() {
    this.score = 0;
    this.match = 1;
    await song.load();
    console.log(this.song);
    structure.createSongElements(this.song);
    structure.createConfirmButton(this.song, this.confirm.bind(this));
  },

  nextMatch() {
    this.match++;
    this.song = song.load();
  },

  confirm(score) {
    this.score = score;
    structure.finishSongFrame(this.song, this.score);
    structure.finishTimeline(this.song);
    structure.createNextButton(this.nextMatch.bind(this));
  },
};

export default game;
