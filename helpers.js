const randomWords = require("random-words");

// Create a new auth token on Spotify and return it
exports.createToken = async function () {
  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  });

  const data = await token.json();

  if (token.status !== 200) throw new Error(`Failed to create token: ${data.error}`);

  return data.access_token;
};

// Returns a random song from Spotify
exports.getRandomSong = async function (token) {
  const MAX_RETRIES = 30;
  const MIN_POPULARITY = 10;
  let retries = 1;
  let randomWord;
  let randomYear;
  let randomOffset;

  const configureQuery = () => {
    const hasWords = Math.random() > 0.5;
    randomWord = hasWords ? randomWords() : "";
    randomOffset = hasWords ? getRandomOffset(10) : getRandomOffset(999);
    randomYear = getRandomYear();
  };

  const fetchSongData = async () => {
    try {
      const song = await fetch(
        `https://api.spotify.com/v1/search?q=${randomWord} year:${randomYear}&type=track&limit=50&offset=${randomOffset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await song.json();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  while (retries <= MAX_RETRIES) {
    try {
      configureQuery();
      const song = await fetchSongData();

      if (!song.tracks.items.length) {
        throw new Error(
          `No songs found for ${
            randomWord ? `word ${randomWord}, ` : ""
          }year: ${randomYear}, offset: ${randomOffset}`
        );
      }

      const validPopularity = song.tracks.items.filter(
        (item) => item.popularity >= MIN_POPULARITY
      );

      if (validPopularity.length === 0) {
        throw new Error(
          `No popular songs for ${
            randomWord ? `word ${randomWord}, ` : ""
          }year: ${randomYear}, offset: ${randomOffset}`
        );
      }

      const randomIndex = Math.floor(Math.random() * validPopularity.length);
      const randomSong = validPopularity[randomIndex];

      const foundSong = {
        query: {
          word: randomWord,
          year: randomYear,
          offset: randomOffset,
        },
        name: randomSong.name,
        artist: randomSong.artists[0].name,
        image: randomSong.album.images[0].url,
        year: randomSong.album.release_date.substring(0, 4),
        url: randomSong.preview_url,
        popularity: randomSong.popularity,
      };

      console.log(foundSong);
      return foundSong;
    } catch (err) {
      console.log(`Error getting random song on retry ${retries}: ${err.message}`);
      retries++;
      if (retries === MAX_RETRIES) {
        console.log(`FATAL: Couldn't get random song after ${MAX_RETRIES} retries`);
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

exports.getTitleImages = async function (token) {
  const randomYear = getRandomYear();
  const fetchSongs = async () => {
    try {
      const songs = await fetch(
        `https://api.spotify.com/v1/search?q=${randomYear}&type=track&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await songs.json();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const data = await fetchSongs();
  const songs = data.tracks.items;
  const images = songs.map((song) => song.album.images[0].url);

  return images;
};

// Returns current year
const CURRENT_YEAR = new Date().getFullYear();

// Returns a random year between 1900 and CURRENT_YEAR
function getRandomYear() {
  return Math.floor(Math.random() * (CURRENT_YEAR - 1900 + 1)) + 1900;
}

// Returns a random offset between 0 and 999
function getRandomOffset(max) {
  return Math.floor(Math.random() * max);
}
