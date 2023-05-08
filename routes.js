const router = require("express").Router();
const Token = require("./token");
const helpers = require("./helpers");

async function auth(req, res, next) {
  const MAX_RETRIES = 5;
  let retries = 1;
  let token;

  // Retry token creation/validation before returning an error
  while (retries <= MAX_RETRIES) {
    try {
      let numberOfTokens = await Token.countDocuments();
      // If there is no token, create one
      if (numberOfTokens === 0) {
        console.log("Creating new token because no tokens exists on database");
        const newToken = await helpers.createToken();
        token = await Token.create({ secret: newToken });
      }
      // If there is a token, validate it
      else {
        token = await Token.findOne({});
        await token.validate();
      }
      break;
    } catch (err) {
      // Log error and retry after 3 seconds if not MAX_RETRIES
      console.log(
        `Error on token creation/validation after retry number ${retries}: ${err.message}`
      );
      retries++;
      if (retries === MAX_RETRIES) {
        console.log(`FATAL: Couldn't create token after ${MAX_RETRIES} retries`);
        return res.status(500).json({ error: err.message });
      }
      // Delete tokens on database
      await Token.deleteMany({});
      // Wait 3 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  req.token = token.secret;
  next();
}

router.get("/random", auth, async (req, res) => {
  try {
    const song = await helpers.getRandomSong(req.token);
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/titleImages", auth, async (req, res) => {
  try {
    const song = await helpers.getTitleImages(req.token);
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
