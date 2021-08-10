const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
const TENOR_KEY = process.env.TENOR_KEY;

const tenorBaseUrl = `https://g.tenor.com/v1/search?key=${TENOR_KEY}&`;
async function getPreview(queryString) {
  try {
    var data = await (
      await fetch(
        tenorBaseUrl + `q=${queryString.replace(/ /g, "%20")}` + `&limit=${1}`
      )
    ).json();
    let randomInd = Math.floor(Math.random(0, 1) * data.results.length);
    if (data.results[randomInd].url) {
      return data.results[randomInd].media[0].gif.preview;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error in getPreview:", err);
    return false;
  }
}

module.exports = {
  getPreview: getPreview,
};
