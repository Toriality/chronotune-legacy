const router = require("express").Router();
const helpers = require("./helpers");
const Token = require("./token");
const TitleImage = require("./titleImage");
const Invalid = require("./invalid");

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
    onTry: async () => {
      const MAX_OFFSET = 999;
      const query = {
        year: helpers.getRandomYear(),
        offset: helpers.getRandomOffset(MAX_OFFSET),
        word: helpers.getRandomWord(),
      };

      if (await Invalid.findOne(query)) {
        const err = new Error("Invalid query found");
        err.name = "InvalidQuery";
        throw err;
      }

      const songs = await helpers.getRandomSong(req.token, query);
    },
    onCatch: async (err, retryCount) => {
      console.log(
        `Failed to get random song after ${retryCount} retries: ${err.message}`
      );
      if (err.name === "InvalidQuery") await Invalid.create(query);
    },
  });

  try {
    const songs = await getRandomSong();
    return res.json(songs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/titleImages", auth, async (req, res) => {
  const createTitleImages = helpers.withRetry(async (token, amount) => {
    console.log(`Creating ${amount} titleImage variants because none exists on database`);
    const newTitleImages = await helpers.createTitleImages(token, amount);
    const titleImages = await TitleImage.create(newTitleImages);
    return titleImages;
  });

  const token = req.token;
  const amount = 5;
  let titleImages = null;
  let numberOfTitleImages = 0;

  try {
    numberOfTitleImages = await TitleImage.countDocuments();
    if (numberOfTitleImages === 0) {
      titleImages = await createTitleImages(token, amount);
    } else {
      const randomIndex = Math.floor(Math.random() * numberOfTitleImages);
      titleImages = await TitleImage.findOne({}).skip(randomIndex);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  return res.json(titleImages);
});

module.exports = router;
