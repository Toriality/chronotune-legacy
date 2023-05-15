const song = {
  id: null,
  name: null,
  artist: null,
  image: null,
  year: null,
  url: null,
  preview: null,
  info: null,

  async load() {
    const song = await fetch("https://chronotune-server.onrender.com/random");
    const data = await song.json();
    this.id = data.id;
    this.name = data.name;
    this.artist = data.artist;
    this.image = data.image;
    this.year = data.year;
    this.url = data.url;
    this.preview = data.preview;
    this.info = data.info;
  },

  get() {
    return {
      id: this.id,
      name: this.name,
      artist: this.artist,
      image: this.image,
      year: this.year,
      url: this.url,
      preview: this.preview,
      info: this.info,
    };
  },

  unload() {
    this.id = null;
    this.name = null;
    this.artist = null;
    this.image = null;
    this.year = null;
    this.url = null;
    this.preview = null;
    this.info = null;
  },
};

export default song;
