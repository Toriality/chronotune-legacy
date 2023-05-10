const randomWords = require("random-words");

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

/**
 * Asynchronously retrieves a random song from the Spotify API based on parameters.
 *
 * @param {string} token - Authorization token for accessing the Spotify API.
 * @param {Object} options - Object containing the parameters.
 * @param {string} options.randomWord - Optional search keyword to include in the search query.
 * @param {number} options.randomYear - Year to include in the search query. Defaults to the current year.
 * @param {number} options.randomOffset - Number of tracks to offset the search results by. Defaults to 0.
 * @return {Promise<Object>} - A Promise that resolves to a JSON object containing information about the random song.
 * @throws {Error} - Throws an error if there is an issue with fetching the song or parsing the response.
 */
exports.getRandomSong = async function (
  token,
  { randomWord = "", randomYear = CURRENT_YEAR, randomOffset = 0 }
) {
  try {
    const query = { year: randomYear, offset: randomOffset, word: randomWord };

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${randomWord} year:${randomYear}&type=track&limit=50&offset=${randomOffset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const songs = await response.json();

    if (response.status !== 200)
      throw new Error(`Failed to fetch song list ${songs.error}`);

    if (songs.tracks.items.length === 0)
      throw new Error(`No songs found [query: ${query}]`);

    const validPopularity = songs.tracks.items.filter(
      (song) => song.popularity >= MIN_POPULARITY
    );

    if (validPopularity.length === 0)
      throw new Error(`No popular songs found [query: ${query}]`);

    const randomIndex = Math.floor(Math.random() * validPopularity.length);
    const randomSong = validPopularity[randomIndex];

    const song = {
      query: query,
      name: randomSong.name,
      artist: randomSong.artists[0].name,
      image: randomSong.album.images[0].url,
      year: randomSong.album.release_date.substring(0, 4),
      popularity: randomSong.popularity,
      url: randomSong.preview_url,
    };

    return song;
  } catch (err) {
    throw new Error(err.message);
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
exports.getRandomYear = function () {
  return Math.floor(Math.random() * (CURRENT_YEAR - 1900 + 1)) + 1900;
};

// Returns a random offset between 0 and 999
exports.getRandomOffset = function (max) {
  return Math.floor(Math.random() * max);
};
