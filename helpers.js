const randomWords = require("random-words");
const Invalid = require("./invalid");

/**
 * Retries an asynchronous function until it succeeds or the maximum number of retries is reached.
 * @param {Object} options The options object.
 * @param {Function} options.onTry The asynchronous function to retry.
 * @param {Function} [options.onCatch] Optional function to execute on each catch block.
 * @param {number} [options.maxRetries=5] The maximum number of retries.
 * @param {number} [options.retryDelay=3000] The delay in milliseconds between retries.
 * @returns {Function} A new function that performs the retry logic.
 */
exports.withRetry = function ({ onTry, onCatch, maxRetries = 5, retryDelay = 3000 }) {
  return async function (...args) {
    let retries = 0;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await onTry(...args);
      } catch (err) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Failed after ${maxRetries} retries: ${err.message}`);
        }
        if (onCatch) {
          const retryCount = retries;
          await onCatch(err, retryCount);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  };
};

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

      if (
        await Invalid.findOne({
          year: randomYear,
          offset: randomOffset,
          word: randomWord,
        })
      ) {
        console.log("Invalid query found", randomWord, randomYear, randomOffset);
        continue;
      }

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
      Invalid.create({
        year: randomYear,
        offset: randomOffset,
        word: randomWord,
      });
      retries++;
      if (retries === MAX_RETRIES) {
        console.log(`FATAL: Couldn't get random song after ${MAX_RETRIES} retries`);
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

// Create random title images for title screen
exports.createTitleImages = async function (token, amount) {
  const imagesSets = [];
  for (let i = 0; i < amount; i++) {
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

    imagesSets.push({
      images,
      year: randomYear,
    });
  }
  return imagesSets;
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
