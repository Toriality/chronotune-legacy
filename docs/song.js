const song = {
  state: "idle", // "idle" | "loaded"
  name: null,
  artist: null,
  image: null,
  year: null,
  url: null,

  async load() {
    console.log("Loading song");
    const song = await fetch("http://localhost:3700/random");
    const data = await song.json();
    this.name = data.name;
    this.artist = data.artist;
    this.image = data.image;
    this.year = data.year;
    this.url = data.url;
    this.state = "loaded";
  },

  get() {
    console.log("Getting song");
    return {
      state: this.state,
      name: this.name,
      artist: this.artist,
      image: this.image,
      year: this.year,
      url: this.url,
    };
  },
};

export default song;
