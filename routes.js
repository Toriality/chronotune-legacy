const router = require("express").Router();
const Token = require("./token");
const helpers = require("./helpers");

async function auth(req, res, next) {
  let numberOfTokens = await Token.countDocuments();
  let token;

  // If there is no tokens, create one
  if (numberOfTokens === 0) {
    try {
      console.log("Creating new token because no tokens exists on database");
      const newToken = await helpers.createToken();
      token = await Token.create({ secret: newToken });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // If there is a token, validate it
  try {
    token = await Token.findOne({});
    await token.validate();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }

  req.token = token.secret;
  next();
}

router.get("/random", auth, async (req, res) => {
  const song = await helpers.getRandomSong(req.token);
  res.json(song);
});

module.exports = router;
