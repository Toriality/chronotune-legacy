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
    structure.init(
      this.confirm.bind(this),
      this.nextMatch.bind(this),
      this.start.bind(this)
    );
    structure.createTimeline();
    await structure.createTitleScreen();
    structure.takeSnapshot();
    this.score = 0;
    this.match = 1;
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

export default game;
