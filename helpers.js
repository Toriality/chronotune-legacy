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
  const song = await fetch(
    `https://api.spotify.com/v1/search?q=year%3A${getRandomYear()}&type=track&limit=1&offset=${getRandomOffset()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await song.json();

  let url = data.tracks.items[0].external_urls.spotify;
  url = url.substring(url.lastIndexOf("/") + 1);

  return {
    name: data.tracks.items[0].name,
    artist: data.tracks.items[0].artists[0].name,
    image: data.tracks.items[0].album.images[0].url,
    year: data.tracks.items[0].album.release_date,
    url: url,
  };
};

// Returns current year
const CURRENT_YEAR = new Date().getFullYear();

// Returns a random year between 1900 and CURRENT_YEAR
function getRandomYear() {
  return Math.floor(Math.random() * (CURRENT_YEAR - 1900 + 1)) + 1900;
}

// Returns a random offset between 0 and 999
function getRandomOffset() {
  return Math.floor(Math.random() * 999);
}
