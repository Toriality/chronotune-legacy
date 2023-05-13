const song = {
  id: null,
  name: null,
  artist: null,
  image: null,
  year: null,
  url: null,

  async load() {
    const song = await fetch("http://localhost:3700/random");
    const data = await song.json();
    this.id = data.id;
    this.name = data.name;
    this.artist = data.artist;
    this.image = data.image;
    this.year = data.year;
    this.url = data.url;
  },

  get() {
    return {
      id: this.id,
      name: this.name,
      artist: this.artist,
      image: this.image,
      year: this.year,
      url: this.url,
    };
  },

  unload() {
    this.id = null;
    this.name = null;
    this.artist = null;
    this.image = null;
    this.year = null;
    this.url = null;
  },
};

export default song;
