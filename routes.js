const router = require("express").Router();
const helpers = require("./helpers");
const Token = require("./token");
const TitleImage = require("./titleImage");
const Invalid = require("./invalid");
const Report = require("./report");

async function auth(req, res, next) {
  const createToken = helpers.withRetry({
    onTry: async () => {
      const newToken = await helpers.createToken();
      const token = await Token.create({ secret: newToken });
      if (!token) throw new Error("Failed to create token");
      return token.secret;
    },
    onCatch: async (err, retryCount) => {
      console.log(`Failed to create token after ${retryCount} retries: ${err.message}`);
    },
  });

  const validateToken = helpers.withRetry({
    onTry: async () => {
      const token = await Token.findOne({});
      await token.validate();
      return token.secret;
    },
    onCatch: async (err, retryCount) => {
      console.log(`Failed to validate token after ${retryCount} retries: ${err.message}`);
      await Token.deleteMany({});
      await createToken();
    },
  });

  let token;
  let numberOfTokens = 0;

  try {
    numberOfTokens = await Token.countDocuments();
    if (numberOfTokens === 0) {
      console.log(`Creating new token because none exists on database`);
      token = await createToken();
    } else {
      token = await validateToken();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }

  req.token = token;
  next();
}

router.get("/random", auth, async (req, res) => {
  const getRandomSong = helpers.withRetry({
    onTry: async (token, maxOffset, minPopularity) => {
      const hasWord = Math.random() >= 0.5;

      const query = {
        word: hasWord ? helpers.getRandomWord() : "",
        year: helpers.getRandomYear(),
        offset: hasWord
          ? helpers.getRandomOffset(10)
          : helpers.getRandomOffset(maxOffset),
      };

      if (await Invalid.findOne(query)) {
        throw new Error("Invalid query found");
      }

      const songs = await helpers.getRandomSongs(token, query);

      const validPopularity = songs.filter((song) => song.popularity >= minPopularity);

      if (validPopularity.length === 0) {
        const err = new Error(
          `No popular songs found [query: w:${query.word} y:${query.year} o:${query.offset}]`
        );
        err.query = query;
        err.name = "InvalidQuery";
        throw err;
      }

      const randomIndex = Math.floor(Math.random() * validPopularity.length);
      const randomSong = validPopularity[randomIndex];

      const data = {
        id: randomSong.id,
        name: randomSong.name,
        artist: randomSong.artists[0].name,
        image: randomSong.album.images[0].url,
        year: randomSong.album.release_date.substring(0, 4),
        popularity: randomSong.popularity,
        url: randomSong.preview_url,
      };

      console.log(query);
      return data;
    },
    onCatch: async (err, retryCount) => {
      console.log(
        `Failed to get random song after ${retryCount} retries: ${err.message}`
      );
      if (err.name === "InvalidQuery") await Invalid.create(err.query);
    },
    maxRetries: 30,
    retryDelay: 1000,
  });

  try {
    const token = req.token;
    const MAX_OFFSET = 900;
    const MIN_POPULARITY = 10;
    const songs = await getRandomSong(token, MAX_OFFSET, MIN_POPULARITY);
    return res.json(songs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/titleImages", auth, async (req, res) => {
  const createTitleImages = helpers.withRetry({
    onTry: async (token, amount) => {
      const newTitleImages = await helpers.createTitleImages(token, amount);
      const titleImages = await TitleImage.create(newTitleImages);
      return titleImages;
    },
    onCatch: async (err, retryCount) => {
      console.log(
        `Failed to create title images after ${retryCount} retries: ${err.message}`
      );
    },
  });

  try {
    const AMOUNT = 5;
    const token = req.token;
    let titleImages = null;
    let numberOfTitleImages = 0;

    numberOfTitleImages = await TitleImage.countDocuments();
    if (numberOfTitleImages === 0) {
      console.log(
        `Creating ${AMOUNT} titleImage variants because none exists on database`
      );
      titleImages = await createTitleImages(token, AMOUNT);
      const randomIndex = Math.floor(Math.random() * titleImages.length);
      return res.json(titleImages[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * numberOfTitleImages);
      titleImages = await TitleImage.findOne({}).skip(randomIndex);
      return res.json(titleImages);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/report", async (req, res) => {
  try {
    const report = {
      type: req.body.type,
      song: req.body.song,
      approved: false,
    };
    await Report.create(report);
    return res.status(200);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
